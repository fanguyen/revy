# Revy — Setup rapide

## 1) Variables d'environnement (Vercel)
- SUPABASE_URL = https://lbmshvzuylidgskpioxi.supabase.co
- SUPABASE_ANON_KEY = (ta clé anon)
- SUPABASE_SERVICE_ROLE_KEY = (ta clé service role — serveur uniquement)
- STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET
- STRAVA_CALLBACK_URL = https://revy.vercel.app/api/strava/callback
- STRAVA_WEBHOOK_VERIFY_TOKEN = choisis une phrase secrète
- VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (à générer)

### Générer les clés VAPID
```bash
npx web-push generate-vapid-keys
```
Copie les deux clés dans Vercel.

## 2) Déployer
```bash
npm install
npm run build
npm start
```
(ou déploie sur Vercel depuis GitHub)

## 3) Créer l'abonnement webhook Strava (une fois déployé)
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions   -d client_id=$STRAVA_CLIENT_ID   -d client_secret=$STRAVA_CLIENT_SECRET   -d callback_url=https://revy.vercel.app/api/strava/webhook   -d verify_token=$STRAVA_WEBHOOK_VERIFY_TOKEN
```

## 4) Tester sur ton téléphone
1. Ouvre https://revy.vercel.app dans Safari (iOS) ou Chrome (Android)
2. Ajoute à l'écran d'accueil (iOS) pour activer les web push
3. Clique **Connecter Strava** et autorise l'accès
4. Clique **Activer les notifications**
5. Fais une activité et upload sur Strava → tu devrais recevoir une notification et voir le conseil sur la page d'accueil.