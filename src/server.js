
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
    cookie: { secure: true ,sameSite:'none'},
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



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});