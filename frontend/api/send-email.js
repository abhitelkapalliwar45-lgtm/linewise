import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'abhitelkapalliwar45@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'obdltvpfomyjjaxo',
  },
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { to, subject, html, text } = req.body || {}

  if (!to) {
    return res.status(400).json({ success: false, error: 'Missing recipient email (to)' })
  }

  try {
    const info = await transporter.sendMail({
      from: `"LineWise Queue Alerts" <${process.env.SMTP_USER || 'abhitelkapalliwar45@gmail.com'}>`,
      to,
      subject,
      text,
      html,
    })

    console.log(`[VercelEmail] Successfully sent email to ${to}: ${info.messageId}`)
    return res.status(200).json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error(`[VercelEmail] Error sending email to ${to}:`, err)
    return res.status(500).json({ success: false, error: err.message })
  }
}