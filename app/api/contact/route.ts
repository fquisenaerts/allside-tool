import { NextResponse } from "next/server"
import { sendEmail } from "@/app/utils/email"

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { name, email, subject, message } = formData

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const emailHtml = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    const result = await sendEmail({
      to: process.env.EMAIL_FROM || "contact@allside.com", // Send to the configured 'from' email or a default
      subject: `New Contact Form Submission: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
      html: emailHtml,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Message sent successfully!" })
    } else {
      console.error("Failed to send email:", result.error)
      return NextResponse.json({ success: false, error: result.error || "Failed to send message" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing contact form submission:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
