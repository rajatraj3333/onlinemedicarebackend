const Resend = require('resend').Resend
const { Html } = require('@react-email/components');
const VARIABLE = require('./emailvar')
const resend = new Resend(process.env.RESEND_KEY);

 function  ResendEmail(HTML,email,subject){
console.log(email);
  let result =   resend.emails.send({
        from: VARIABLE.FROM,
        to: email,
        subject: subject,
        html:`${HTML}`
    
    })
    return result

    }


module.exports=ResendEmail