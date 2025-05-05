import nodemailer from "nodemailer"

interface SendEmailParams {
  to: string
  subject: string
  text: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Allside Reports"}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
      attachments,
    })

    console.log("Email sent:", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
