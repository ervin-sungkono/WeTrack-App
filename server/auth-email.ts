import 'server-only'

import nodemailer from 'nodemailer'
import { adminAuth } from './db'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export async function sendVerificationEmail(email: string, fullName: string): Promise<void> {
  const sender = process.env.EMAIL
  const password = process.env.EMAIL_PASS
  const publicUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_LOGIN_DOMAIN
  if (!sender || !password || !publicUrl) {
    throw new Error('Email verification is not configured')
  }

  const continueUrl = new URL('/login', publicUrl).toString()
  const verificationLink = await adminAuth.generateEmailVerificationLink(email, { url: continueUrl })
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: sender, pass: password },
    disableFileAccess: true,
    disableUrlAccess: true,
  })

  await transport.sendMail({
    from: sender,
    to: email,
    subject: 'Verify your WeTrack account',
    text: `Hi ${fullName}, verify your WeTrack account: ${verificationLink}`,
    html: `<p>Hi ${escapeHtml(fullName)},</p><p><a href="${escapeHtml(verificationLink)}">Verify your WeTrack account</a></p>`,
  })
}
