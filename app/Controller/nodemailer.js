const nodemailer = require('nodemailer')

const config = {
    // service:'zoho',
    host:"smtp.zoho.in",
    port:465,
    secure:true,
    auth:{
        user:'admin@meddaily.in',
        pass:"6m8PsL0xxYbh"
    }
}


module.exports = {
    sendEmail: async (data)=>{
           const transport = nodemailer.createTransport(config)

           transport.sendMail(data, (err,info)=>{
            if(err){
                console.log(err)
            }else{
                console.log(info)
            }
           })
    }
}