// pages/api/strava/webhook.js

import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import fetch from 'node-fetch'
import { basicAdvice } from '../../../lib/basicAdvice'
import { setupVapid } from '../../../lib/push'

export default async function handler(req, res) {
  // 1) Vérification Strava (GET / subscribe)
  if (req.method === 'GET') {
    const challenge =
      req.query['hub.challenge'] ||
      req.query['hub_challenge'] ||
      req.query.challenge ||
      null

    const token =
      req.query['hub.verify_token'] ||
      req.query['hub_verify_token'] ||
      req.query.token ||
      null

    // Optionnel : vérifier le token
    if (
      process.env.STRAVA_WEBHOOK_VERIFY_TOKEN &&
      token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
    ) {
      return res.status(403).send('bad token')
    }

    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ 'hub.challenge': challenge })
  }

  // 2) Webhook Strava (POST: nouvel événement)
  if (req.method === 'POST') {
    const body = req.body

    // On ne traite que les événements "création d'activité"
    if (body.object_type === 'activity' && body.aspect_type === 'create') {
      const stravaActivityId = body.object_id
      const ownerId = String(body.owner_id) // id Strava de l'athlète

      try {
        // Récupérer l'utilisateur lié à ce strava_id
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('strava_id', ownerId)
          .single()

        if (userError || !user) {
          console.error('No user for strava_id', ownerId, userError)
          return res.status(200).json({ ok: true })
        }

        // Récupérer les détails de l’activité depuis l’API Strava
        const actResp = await fetch(
          `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
          {
            headers: {
              Authorization: `Bearer ${user.strava_access_token}`,
            },
          }
        )
        const activity = await actResp.json()

        // Sauvegarder l’activité
        const { data: act, error: actError } = await supabaseAdmin
          .from('activities')
          .insert({
            user_id: user.id,
            strava_activity_id: stravaActivityId,
            type: activity.type,
            distance: activity.distance,
            moving_time: activity.moving_time,
            elevation_gain: activity.total_elevation_gain,
            start_date: activity.start_date,
            raw_payload: activity,
          })
          .select()
          .single()

        if (actError) {
          console.error('Error inserting activity', actError)
          return res.status(200).json({ ok: true })
        }

        // Générer un conseil (version simple sans OpenAI)
        const text = basicAdvice(activity)

        const { data: advice, error: adviceError } = await supabaseAdmin
          .from('advices')
          .insert({
            activity_id: act.id,
            user_id: user.id,
            text,
            metadata: { source: 'rule-based' },
          })
          .select()
          .single()

        if (adviceError) {
          console.error('Error inserting advice', adviceError)
        }

        // (Optionnel) envoyer une notification push si tu as configuré les VAPID keys
        if (user.push_subscription && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
          try {
            const webpush = setupVapid()
            await webpush.sendNotification(
              user.push_subscription,
              JSON.stringify({
                title: 'Revy — Conseils post-séance',
                body: 'Tes conseils de récup sont prêts 👇',
                url: '/', // tu pourras plus tard mettre /advice/<id>
              })
            )
          } catch (e) {
            console.error('webpush error', e)
          }
        }
      } catch (e) {
        console.error('Webhook error', e)
      }
    }

    return res.status(200).json({ ok: true })
  }

  // Méthode non supportée
  return res.status(405).json({ error: 'Method not allowed' })
}

