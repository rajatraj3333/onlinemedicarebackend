
const express =require('express')
const cors =require('cors')
const Resend = require('resend').Resend
const dotenv = require('dotenv')
const routes = require('./routes')
const multer = require('multer')
const fs = require('fs');
const app = express();
const path = require('path')
const { Pool } = require('pg');
const session = require('express-session');
const User = require('./controller/auth')
const cokkieparser = require('cookie-parser');
const pool = require('./config/db')
const  pgSession = require('connect-pg-simple')(session);
const port = process.env.PORT || 5000;
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';



app.use(cors({
  origin: isProduction 
    ? ['https://onlinemedicares.netlify.app', 'https://www.onlinemedicares.netlify.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cokkieparser());

 
 
// const fileUpload = require('express-fileupload');
// app.use(fileUpload())
  



// Create uploads directory if it doesn't exist

app.use('/uploads', express.static('uploads'));


// Upload endpoint

// app.post('/api/file/upload', function(req, res) {

//     const file = req.files?.file
//       console.log(req?.files)


//     let {name} =file
 
//   name=  name.replaceAll(' ','')
 

//    if (req.files===null || Object.keys(req.files).length === 0) {
//      return res.status(400).send('No files were uploaded.');
//    }
  
 
    
//   // uploadPath = __dirname + '/../uploads/' + file.name;
 
//  uploadPath =`${__dirname}/../uploads/${name}`
 
//  console.log(uploadPath)
//    // Use the mv() method to place the file somewhere on your server
//    file.mv(uploadPath, function(err) {
//      if (err)
//        return res.status(500).send(err);
 
//    res.json({filename:name,filepath:`/uploads/${name}`})
//    });
 

// })


const pgPool = new Pool({
    // Insert pool options here
    connectionString: process.env.DATABASE_URL,
});




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