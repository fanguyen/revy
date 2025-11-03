import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req,res){
  // For demo, just grab any user and last advice (in real life, authenticate or map by strava_id cookie/session)
  const { data: advice } = await supabaseAdmin
    .from('advices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  res.json({ lastAdvice: advice?.[0] || null })
}