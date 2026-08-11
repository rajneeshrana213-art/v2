import nodemailer from 'nodemailer'

const mailSender = async (email: string, title: string, body: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      secure: false,
    })

    const info = await transporter.sendMail({
      from: `"LearnXChain LMS" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })
    
    console.log(info.response)
    return info
  } catch (error: any) {
    console.error(error.message)
    throw error
  }
}

export default mailSender
