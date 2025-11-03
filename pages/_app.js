import { useEffect } from 'react'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }){
  useEffect(()=>{
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').catch(()=>{})
    }
  },[])

  return (<>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <Component {...pageProps} />
  </>)
}