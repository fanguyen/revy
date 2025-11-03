import { useEffect, useState } from 'react'

export default function Home(){
  const [me, setMe] = useState(null)
  const [subStatus, setSubStatus] = useState('...')

  useEffect(()=>{
    fetch('/api/me').then(r=>r.json()).then(setMe).catch(()=>{})
  },[])

  async function subscribePush(){
    if (!('serviceWorker' in navigator) || !('PushManager' in window)){
      setSubStatus('Push non supporté sur ce navigateur.')
      return
    }
    const reg = await navigator.serviceWorker.ready
    const res = await fetch('/api/push/publicKey')
    const { publicKey } = await res.json()
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
    await fetch('/api/push/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub)})
    setSubStatus('Abonnement aux notifications: OK ✅')
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
  }

  return (
    <main style={{fontFamily:'system-ui, -apple-system, Segoe UI, Roboto', maxWidth:720, margin:'0 auto', padding:24}}>
      <h1 style={{marginBottom:8}}>Revy — conseils post-entraînement</h1>
      <p style={{opacity:.8}}>Connecte Strava, reçois une notification avec des conseils dès que ton activité est uploadée.</p>

      <div style={{marginTop:24}}>
        <a href="/api/strava/auth"><button>Connecter Strava</button></a>
        <button onClick={subscribePush} style={{marginLeft:12}}>Activer les notifications</button>
        <div style={{marginTop:8, fontSize:14}}>{subStatus}</div>
      </div>

      <hr style={{margin:'24px 0'}} />

      <h3>Dernier conseil</h3>
      <pre style={{whiteSpace:'pre-wrap', background:'#f6f6f6', padding:12, borderRadius:8}}>
        {me?.lastAdvice?.text || 'Aucun conseil encore. Fais une activité Strava pour tester.'}
      </pre>
    </main>
  )
}