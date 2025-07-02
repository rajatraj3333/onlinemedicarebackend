const express = require('express');
const { google } = require('googleapis');
const pool =require('../config/db')
const app = express.Router();

 

const oauth2Client = new google.auth.OAuth2(
 process.env.CLIENT_ID,
 process.env.CLIENT_SECRET, 
 process.env.NODE_ENV==='development'?'http://localhost:3000/auth/callback':'https://onlinemedicares.netlify.app/auth/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

app.get('/auth/url', (req, res) => { 
    console.log('URL HIT')
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  }); 
  res.send({ url });
});  

app.post('/auth/callback', async (req, res) => {
  // const { code } = req.query;


  try {
    
  const { code,booking_id,bookingtime,durationtime } = req.body;
  console.log(req.body);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log(code,tokens,'CODE+TOKENS')
  let duration = new Date(bookingtime);
  console.log(new Date(bookingtime).toISOString())
  console.log(new Date(Date.now(bookingtime) + 30 * 60000).toISOString())
 
  //  start: { dateTime: new Date().toISOString() },
  // https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events&response_type=code&client_id=851190018857-s03edd1uok957hpcu618s01ts7i7ur5r.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback 
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = {
    summary: 'Test Meet',
  start: { dateTime: new Date(Date.now(bookingtime) + 30 * 60000).toISOString() },
    end:  { dateTime: new Date(bookingtime).toISOString() },
    conferenceData: {
      createRequest: { requestId: 'meet-' + Date.now() } 
    }, 
  };   

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  const meetLink = response.data.hangoutLink;
  console.log(meetLink);

  if(meetLink){
      let sqlStatement = `update patient set meetinglink =$1, meeting_time=$2 where booking_id=$3`
      let result = await pool.query(sqlStatement,[meetLink,bookingtime,booking_id])
      console.log(result);
      if(result.rowCount){
        res.status(200).json({message:'Update Successfully',meetLink:meetLink});
      }
  }

  } catch (error) {
    console.log(error);
      res.status(400).json({error:'Select correct time '})
  } 
  
  // res.status(200).json({meetLink:meetLink}); 
});  

app.post('/updatetime',(req,res)=>{
console.log(req.body); 
});  
 
app.post('/updateverify',async(req,res)=>{
    try {
      const {booking_id,meetLink}=req.body
      let sqlStatement = `update patient set meetinglink =$1 where booking_id=$2`
      let result = await pool.query(sqlStatement,[meetLink,booking_id])
      console.log(result);
      if(result.rowCount){
        res.status(200).json({message:'Update Successfully'});
      }
    } catch (error) {
          res.send({error:error}) 
    } 
})

 
module.exports=app        