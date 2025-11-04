import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import fetch from 'node-fetch'
import { basicAdvice } from '../../../lib/basicAdvice.js'
import { setupVapid } from '../../../lib/push'

export default async function handler(req,res){
  if (req.method === 'GET') {
    const challenge =
      req.query['hub.challenge'] ||
      req.query['hub_challenge'] ||
      req.query.challenge ||
      null;

    const token =
      req.query['hub.verify_token'] ||
      req.query['hub_verify_token'] ||
      req.query.token ||
      null;

    // Pour le moment on ignore le token, juste pour valider la vérif Strava
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ "hub.challenge": challenge });
  }

  // Pour les POST Strava (événements), on répond juste ok pour le moment
  return res.status(200).json({ ok: true });
}
