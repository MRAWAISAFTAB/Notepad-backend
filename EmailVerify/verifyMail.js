import nodemailer from "nodemailer"
import "dotenv/config"
import handlebars from "handlebars"

const templateSource = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Email</title>
  <style>
    body { margin: 0; padding: 0; background: #f2f5f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { width: 100%; padding: 40px 0; }
    .card { max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.08); }
    .top-bar { height: 6px; background: linear-gradient(90deg, #00c853, #00b0ff); }
    .content { padding: 40px 35px; text-align: center; }
    h1 { margin: 0 0 15px; font-size: 24px; color: #222; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin: 15px 0; }
    .btn { display: inline-block; margin-top: 25px; padding: 14px 30px; background: linear-gradient(90deg, #00c853, #00b0ff); color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; }
    .divider { margin: 30px auto; width: 60px; height: 3px; background: #00c853; border-radius: 5px; }
    .footer { background: #fafafa; padding: 20px; text-align: center; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="top-bar"></div>
      <div class="content">
        <h1>Email Verification Required</h1>
        <div class="divider"></div>
        <p>Hello,</p>
        <p>You're almost there! Please confirm your email address to activate your account and start using our platform.</p>
        <a href="https://notepad-frontend-two.vercel.app/verify/{{token}}" class="btn" target="_blank">Confirm Email</a>
        <p style="margin-top:30px; font-size:14px; color:#777;">If you didn't create an account, you can safely ignore this message.</p>
      </div>
      <div class="footer">© 2026 NoteLeaf — Secure Authentication System</div>
    </div>
  </div>
</body>
</html>`

export const verifyMail = async (token, email) => {
    const template = handlebars.compile(templateSource)
    const htmlToSend = template({ token: encodeURIComponent(token) })

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        html: htmlToSend,
    })
    console.log("Email sent Successfully")
}