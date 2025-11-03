import fetch from 'node-fetch'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req,res){
  const { code } = req.query
  if(!code) return res.status(400).send('Missing code')

  const tokenResp = await fetch('https://www.strava.com/oauth/token', {
    method:'post',
    headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code
    })
  })
  const tokenJson = await tokenResp.json()
  if(!tokenResp.ok){
    return res.status(400).json(tokenJson)
  }

  const { athlete, access_token, refresh_token, expires_at } = tokenJson
  const { id: stravaId, email } = athlete || {}

  // upsert user by strava_id
  await supabaseAdmin.from('users').upsert({
    strava_id: String(stravaId),
    email: email || null,
    strava_access_token: access_token,
    strava_refresh_token: refresh_token,
    strava_expires_at: new Date(expires_at * 1000).toISOString()
  }, { onConflict: 'strava_id' })

  res.redirect('/')
}