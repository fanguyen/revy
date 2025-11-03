import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { setupVapid } from '../../../lib/push'

export default async function handler(req,res){
  const { data: users } = await supabaseAdmin.from('users').select('*').not('push_subscription','is', null).limit(1)
  if(!users || users.length===0) return res.status(200).json({sent:false, reason:'no subscribers'})
  const user = users[0]
  const webpush = setupVapid()
  try{
    await webpush.sendNotification(user.push_subscription, JSON.stringify({
      title:'Revy — Test',
      body:'Ceci est une notification test.',
      url:'/'
    }))
    res.json({ sent: true })
  }catch(e){
    res.status(500).json({ sent:false, error: String(e) })
  }
}