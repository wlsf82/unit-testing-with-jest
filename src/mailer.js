// The real email client. It only reads MAIL_API_URL when send() is called,
// so requiring this module never fails, and calling it without the variable
// fails loudly instead of sending anything.
function send({ to, subject, body }) {
  const url = process.env.MAIL_API_URL

  if (!url) {
    throw new Error('MAIL_API_URL is not set')
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`mail API answered ${response.status}`)
    }

    return response.json()
  })
}

module.exports = { send }
