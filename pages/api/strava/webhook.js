import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import fetch from 'node-fetch'
import { basicAdvice } from '../../../lib/basicAdvice.js'
import { setupVapid } from '../../../lib/push'

export default async function handler(req,res){
   if (req.method === 'GET') {
    const mode = req.query['hub.mode'] || req.query['hub_mode'] || req.query.mode;
    const challenge = req.query['hub.challenge'] || req.query['hub_challenge'] || req.query.challenge;
    const token = req.query['hub.verify_token'] || req.query['hub_verify_token'] || req.query.token;

    // Vérification du token (optionnelle au début, mais mieux de la garder)
    if (process.env.STRAVA_WEBHOOK_VERIFY_TOKEN && token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return res.status(403).send('bad token');
    }

    // Réponse EXACTEMENT comme Strava veut : JSON avec hub.challenge
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ "hub.challenge": challenge });
  }

  // handle events
  const body = req.body
  if(body.object_type === 'activity' && body.aspect_type === 'create'){
    const stravaActivityId = body.object_id
    const ownerId = body.owner_id

    // find user
    const { data: user } = await supabaseAdmin.from('users').select('*').eq('strava_id', String(ownerId)).single()
    if(!user){ return res.status(200).send('ok') }

    // fetch activity details
    const r = await fetch(`https://www.strava.com/api/v3/activities/${stravaActivityId}`, {
      headers: { Authorization: `Bearer ${user.strava_access_token}` }
    })
    const activity = await r.json()

    // insert activity
    const { data: act } = await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      strava_activity_id: stravaActivityId,
      type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elevation_gain: activity.total_elevation_gain,
      start_date: activity.start_date,
      raw_payload: activity
    }).select().single()

    // generate simple (non-IA) advice
    const text = basicAdvice(activity)

    const { data: advice } = await supabaseAdmin.from('advices').insert({
      activity_id: act.id,
      user_id: user.id,
      text,
      metadata: { source: 'rule-based' }
    }).select().single()

    // push notif if subscribed
    if(user.push_subscription){
      try{
        const webpush = setupVapid()
        await webpush.sendNotification(user.push_subscription, JSON.stringify({
          title:'Revy — Conseils',
          body: 'Tes conseils de récup sont prêts 👇',
          url: '/'
        }))
      }catch(e){ console.error(e) }
    }
  }

  res.status(200).send('ok')
}
