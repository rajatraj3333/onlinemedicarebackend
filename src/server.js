
const express =require('express')
const cors =require('cors')
const Resend = require('resend').Resend
const dotenv = require('dotenv')
const routes = require('./routes')
const app = express();

const { Pool } = require('pg');
const session = require('express-session');
const User = require('./controller/auth')
const cokkieparser = require('cookie-parser');
const  pgSession = require('connect-pg-simple')(session);
const port = process.env.PORT || 5000;
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';





app.use(express.json());
app.use(cokkieparser());

const pgPool = new Pool({
    // Insert pool options here
    connectionString: process.env.DATABASE_URL,
});


app.use(cors({
  origin: isProduction 
    ? ['https://onlinemedicares.netlify.app', 'https://www.onlinemedicares.netlify.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // true in production, false in development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProduction ? 'none' : 'lax'
  },
   store: new pgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
      ttl:  60 * 60*1.5, // Session expiration time in seconds (1.5 hours)
 
      ttl:  60 * 60*1.5,
    })

}));

app.use('/api',routes);
console.log('SERVER STARTED')

console.log(process.env.RESEND_KEY)
const resend = new Resend(process.env.RESEND_KEY);



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 