import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const subscription = req.body
  // For demo: attach to the most recent user (in production, map to the authenticated user)
  const { data: lastUser } = await supabaseAdmin.from('users').select('*').order('created_at',{ascending:false}).limit(1)
  if(!lastUser || lastUser.length===0) return res.status(200).json({ok:true})
  await supabaseAdmin.from('users').update({ push_subscription: subscription }).eq('id', lastUser[0].id)
  res.json({ ok: true })
}