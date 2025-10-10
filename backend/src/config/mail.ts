import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kelvin.ziemann67@ethereal.email',
        pass: '3Wuqfg6qS2q2WtNT8A'
    }
});

export async function sendOtp(to: string, otp: string){
    const mailOptions = {
        from: `"OTP service" <mikel.stanton5@ethereal.email>`,
        to: to,
        subject: "your OTP code",
        text: `your OTP code is ${otp}`,
        html: `<p> your OTP code is: <strong>${otp}</strong> </p>`
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log({message:"email sent" + info.response});
    } catch (error) {
        console.error(`error sending email`, error);
        throw error;
    }
}