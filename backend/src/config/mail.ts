import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'mikel.stanton5@ethereal.email',
        pass: 'JGpE2hQerD8TCr2m5g'
    }
});

export function sendOtp(to: string, otp: string){
    const mailOptions = {
        from: `"OTP service" <mikel.stanton5@ethereal.email>`,
        to: to,
        subject: "your OTP code",
        text: `your OTP code is ${otp}`,
        html: `<p> your OTP code is: <strong>${otp}</strong> </p>`
    }
    return transporter.sendMail(mailOptions).then(info => {console.log({message:"email sent" + info.response})}).catch(error => {console.error(`error sending email`, error); throw error})
}