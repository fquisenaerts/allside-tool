import { Resend } from "resend"

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

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.EMAIL_FROM || "contact@allside.com"
    const fromName = process.env.EMAIL_FROM_NAME || "Allside Reports"

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to], // Resend 'to' expects an array of strings
      subject,
      html,
      text,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    })

    if (error) {
      console.error("Error sending email with Resend:", error)
      return { success: false, error: error.message }
    }

    console.log("Email sent with Resend:", data?.id)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
