import nodemailer from "nodemailer"

interface IMailInformation{
    to:string,
    subject:string,
    html:string
}

const sendMail=async(mailInformation:IMailInformation)=>{
    const transpoter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.NODEMAILER_EMAIL,
            pass:process.env.NODEMAILER_PASSWORD,
        }
    })
    const mailFormatObject={
    from:"ABC Language Institute",
    to:mailInformation.to,
    subject:mailInformation.subject,
    html:mailInformation.html
    }
    try {
        await transpoter.sendMail(mailFormatObject)
    } catch (error) {
    console.log(error) 
    }

}

export default sendMail

