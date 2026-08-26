const KEY = process.env.BOLD_IDENTITY_KEY
setTimeout(() => process.exit(0), 20000)
async function main() {
  const res = await fetch('https://integrations.api.bold.co/online/link/v1/LNK_OZIUFP8609', {
    headers: { 'Authorization': `x-api-key ${KEY}` },
  })
  console.log(res.status, JSON.stringify(await res.json(), null, 2))
}
main().catch((e) => { console.error('ERROR:', e.message) })
