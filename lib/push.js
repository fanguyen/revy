import webpush from 'web-push'

export function setupVapid(){
  const contact = process.env.VAPID_CONTACT_MAIL || 'mailto:admin@revy.app'
  webpush.setVapidDetails(contact, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
  return webpush
}