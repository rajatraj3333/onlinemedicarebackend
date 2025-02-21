
const express =require('express')
const cors =require('cors')
const Resend = require('resend').Resend
const dotenv = require('dotenv')
const routes = require('./routes')
const app = express();

const port = process.env.PORT || 5000;
dotenv.config();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

console.log(process.env.RESEND_KEY)
const resend = new Resend(process.env.RESEND_KEY);

app.get("/send", async (req,res) => {
  console.log('api hit')
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["rajatkumar108@hotmail.com"],
    subject: "hello world",
    html: `
  
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
   
        
    </style>
  </head>
  <body>
    <div class="container">

    
<h2>Your Appointment is booked with Doctor</h2>
       <table>
        <thead>
    <tr style="background-color: #65b031;">
        <td>Patient Name</td>
        <td>Doctor Name</td>
        <td>Date</td>
        <td>Timing</td>
        <td>Payment</td>
    </tr>
</thead>
<tbody>
    <tr>
        <td>Mr Hiroshi</td>
        <td>Dr Hiroshi Kumar Sharma</td>
        <td>04-01-2025</td>
        <td>12:45 PM</td>
        <td>Payment Done</td>
        </tr>
    </tbody>
    </table>
</div>
  </body>
</html>


    `,
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});