import nodemailer from "nodemailer"

// Email transporter configuration
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Function to send an email
export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string | string[]
  subject: string
  text: string
  html: string
  attachments?: Array<{
    filename: string
    content?: Buffer | string
    path?: string
    contentType?: string
  }>
}) {
  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Allside"}" <${process.env.EMAIL_FROM || "noreply@example.com"}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      html,
      attachments,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}
