import nodemailer from "nodemailer";

const transpoter = nodemailer.createTransport({service: "gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    },
});

export async function sendMail({to,subject,html}) {
    try{
        await transpoter.sendMail({
            from:`"My Shop" <${process.env.EMAIL_USER}>`,to,subject,html,
        });
    }catch(err){
        console.error("Email send failed",err.message);
    }
    
}