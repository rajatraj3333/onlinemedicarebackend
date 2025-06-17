
const express =require('express')
const cors =require('cors')
const Resend = require('resend').Resend
const dotenv = require('dotenv')
const routes = require('./routes')
const app = express();

const { Pool } = require('pg');
const session = require('express-session');
const User = require('./controller/auth')
const  pgSession = require('connect-pg-simple')(session);
const port = process.env.PORT || 5000;
dotenv.config();
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true   
  
               // allow cookies to be sent
}));
app.use(express.json());

 

const pgPool = new Pool({
    // Insert pool options here
    connectionString: process.env.DATABASE_URL,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // resave: false,
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false ,sameSite:'lax'},
    store: new pgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
      ttl:  60 * 60*1.5, // Session expiration time in seconds (1.5 hours)
 
    })
               
  })
); 
 
// app.use((req,res,next)=>{
//    if (!req.session.views) {
//     req.session.views = 1;
//   } else {
//     req.session.views++;
//   }
//   console.log(`Session ID: ${req.session}, Views: ${req.session.views}`);
//   next();
// });

// app.get('/test',(req,res)=>{
//   res.send('Welcome to the Doctor Appointment Booking System');
// })

app.use('/api',routes);

console.log('SERVER STARTED')

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