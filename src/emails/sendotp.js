function SENDOTPHTML (data){ 

    let HTML= `
    <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>

         .container{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);  
            font-family: sans-serif; 
         }

        table{
            border-collapse: collapse;
            width: 600px; 
        }
         table tr td{
            padding: 10px;
        }

        .str{
            display: block;
            margin-top: 40px;
        }
   
        
    </style>
  </head>
  <body>
    <div class="container">

    
<h2>One more step to change your password </h2>
<h4>Hi ${data.name}</h4>
   <span>We got your request to change your password</span>

  <!-- <br> -->
   <strong class="str">(OTP): ${data.otp} used this otp to change your password</strong>
</div>
  </body>
</html>
    `

    return HTML


}

module.exports=SENDOTPHTML