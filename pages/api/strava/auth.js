export default function handler(req,res){
  const clientId = process.env.STRAVA_CLIENT_ID
  const redirect = encodeURIComponent(process.env.STRAVA_CALLBACK_URL)
  const scope = 'activity:read_all'
  const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&approval_prompt=auto&scope=${scope}`
  res.redirect(url)
}