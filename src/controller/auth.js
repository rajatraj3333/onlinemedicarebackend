const { randomBytes, scryptSync, timingSafeEqual } = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const uniqueuserid = require("../../utils/uniquegen");
const { error } = require("console");
const { stat, readSync } = require("fs");
const SENDOTPHTML =require('../emails/sendotp.js');
const ResendEmail = require("../emails/config");
const Validation = require('../../utils/validator').userValidationSchema
const userValidation = require('../../utils/validator.js').patientregister
const dayjs =require('dayjs');
const { response, query } = require("express");
const { func } = require("joi");
let User = {
  async register(req, res) {
    let client = pool.connect();
    const {
      name,
      fullname,
      email,
      password,
      roles,
      joiningdate,
      department,
      lastdate,
      fees,
    } = req.body;
    console.log("BODY->", req.body);

    const salt = randomBytes(16).toString("hex");
    let hashedpassword = scryptSync(password, salt, 64).toString("hex");
    let uniqueId = await uniqueuserid(2, 8);
    // console.log(`${salt}:${hashedpassword}`);
    hashedpassword = `${salt}:${hashedpassword}`;

    try {
      await userValidation.validateAsync(req.body)
      await pool.query("BEGIN");
      let result = await pool.query(
        `select email,user_id from users where email ilike $1`,
        [email]
      );
      if (result.rowCount) {
        res.json({ error: `user ${result.rows[0].email} already exits` });
        return;
      }

      const time = roles != "Patient" ? joiningdate : "now()";

      let userResult = await pool.query(
        `insert into users (user_id,name,fullname,email,roles,password,created_at)
                            values($1,$2,$3,$4,$5,$6,$7) returning user_id `,
        [uniqueId, name, fullname, email, roles, hashedpassword, time]
      );

  

      if (roles === "Doctor" || roles === 'Associate Doctor' || roles === 'Staff' || roles === 'Associate' ) {
        await pool.query(
          `insert into doctor (doctor_id,user_id,name,fullname,department,joiningdate,lastdate,fees)
             values($1,$2,$3,$4,$5,$6,$7,$8) returning doctor_id`,
          [result.rows[1].user_id,uniqueId,name, fullname, department, time, lastdate, fees]
        );
      }
      await pool.query("COMMIT");

      const token = jwt.sign({ userid: userResult.rows[0].user_id }, process.env.SEC_KEY, {
        expiresIn: "1h",
      });
      console.log(jwt.verify(token, process.env.SEC_KEY));
      res.json({ response: userResult.rows, token: token, status: 200 });
    } catch (error) {
      await pool.query('ROLLBACK') 
        console.log(error);
        if(error.details!=undefined && error.details.length){
          res.json({error: error.details.map(item=>item.message)+""})
         } 
     
    } 
    // await pool.release();
  
    console.log("error happens");
  },

  async login(req, res) {
    const { email, password } = req.body;
    console.log(req.body);
    let sqlStatement = `
        select password,user_id,roles from users where email ilike $1
        `;
    let pass = await pool.query(sqlStatement, [email]);
    if (!pass.rowCount) {
      res.json({ error: "email did  not match" });
      return;
    }
    // console.log(pass);
    const [salt, key] = pass.rows[0].password.split(":");
    // console.log(salt,key)
    const unhashed = scryptSync(password, salt, 64);
    const keybuff = Buffer.from(key, "hex");
    const match = timingSafeEqual(unhashed, keybuff);
    const userid = pass.rows[0].user_id;
    const {roles} =pass.rows[0];
    if (match) {
      const jwttoken = jwt.sign({ userid: userid }, process.env.SEC_KEY, {
        expiresIn: "1h",
      });
      console.log(jwttoken,'JWT TOKEN');
      console.log(req.session)
      if(jwttoken){
        req.session.userID = jwttoken;
      }
      req.user= jwttoken
      res.json({ token: jwttoken,roles:roles,email:email });
      console.log(match);
    } else {
      res.json({ error: "password did not match" });
    } 
  },
  auth: function (req, res, next) {
    // console.log(req);
    const token = req.header("X-Authorization");
    console.log(token, "token");
    if(req.session.userID || token){
    jwt.verify(token || req.session.userID, process.env.SEC_KEY, (err, decoded) => {
      try {
        if(req.session.userID){
        req.user=decoded;
        // req.session.userID = decoded.userid;
        console.log("sessionID", req.session.userID);
        next();
        }
       else { 
        res.json({ error: "Invalid authorization", status: "401" });
        return;
        }

      } catch (err) {
        console.log(err);
        res.json({ error: "Invalid authorization", status: "401" });
    }
  })
}
  else { 
        res.json({ error: "Invalid authorization", status: "401" });
        return;
        }
  },
  async generateotp(req, res) {
    console.log(req.body);
    const {email}=req.body;
    // console.log(req.user);
    const otp = await uniqueuserid(4, 6);
    
    try {
      await pool.query('BEGIN')
      let getuserid= await pool.query(`select user_id from users where email ilike $1`,[email])
      if(!getuserid.rows.length){
         res.json({message:'Email does not exists'}) 
         return;
      }

      else {
      const { user_id } = getuserid.rows[0];
      console.log(user_id)
      if(user_id){
       

      let result = await pool.query(
        `insert into otpverify (user_id,created_at,otp)
        values ($1,$2,$3)
        returning user_id,created_at,otp
         `,
        [user_id, "now()", otp]
      );
      
      if (result.rowCount) {
        let insertintoaudittab = await pool.query(
          `insert into otpverifyaudit (user_id,created_at,otp)
        values ($1,$2,$3)
            `,
          [user_id, "now()", otp]
        );
       
        if (insertintoaudittab.rowCount) {

          let getuseremail = await pool.query(`select name,email from users where user_id=$1`,[user_id])
          if(getuseremail.rowCount){
           const {name,email} =getuseremail.rows[0]
          let htmlcontent= SENDOTPHTML({name,otp})
         
          let result = await ResendEmail(htmlcontent,email,'Otp reset')
   
          console.log(result);
          if(result.data!=null){
      }
       else {
        res.json({ message:'something went wrong can not send otp on email' });
        await pool.query('ROLLBACK');
       }
          }
          // console.log(result);
        }
      }
    }
    else{
      res.json({message:'Email does not exists'})
      return;
    }
      await pool.query('COMMIT')
  }
    } catch (error) {
      await pool.query('ROLLBACK')
      console.log(error);
      res.json({ message:'can not enter data'});
    }
  },
  async verifyotp(req, res) {
    let { otp,email } = req.body;

    try {
      let getuserid= await pool.query(`select user_id from users where email ilike $1`,[email])
      const { user_id } = getuserid.rows[0];
      console.log(user_id)
      if(user_id){
      
      pool.query('BEGIN')
      let response = await pool.query(
        `select otp,user_id from otpverify where user_id=$1 and otp=$2`,
        [user_id, Number(otp)]
      );
     
      if (response.rowCount) {
       
        const { otp, user_id } = response.rows[0];
        const urlid = await uniqueuserid(2,10)
        let updatestatus = await pool.query(
          `update otpverifyaudit set url = $1 where otp=$2 and user_id =$3 `,
          [urlid, otp, user_id]
        );
        if (response.rowCount && updatestatus.rowCount) {
          let deletefromotpverify = await pool.query(
            `delete from otpverify where user_id=$1 and otp=$2`,
            [user_id, otp]
          );

          if (deletefromotpverify.rowCount) res.json({url:urlid});
        }
      }
      else {

        res.json({response:'invalid otp',status:401})
        return;
      }
    }
    else {
      await pool.query('ROLLBACK')
       res.json({error:'cant verify otp right now'})
    }

      pool.query('COMMIT')
    } catch (error) {
     await pool.query('ROLLBACK')
      res.json({response:'something went wrong'})
    }
 
    // console.log(updatestatus);
  },
  async changepassword(req,res){
         const {url,password,email}=req.body
         
     
         try {
         await pool.query('BEGIN')
        
         let getuserid= await pool.query(`select user_id from users where email ilike $1`,[email])
        
         const { user_id } = getuserid.rows[0];
         console.log(user_id)
         if(user_id){ 
            

         let result =await pool.query(`select url,otp from otpverifyaudit where url=$1 and status IS NULL or status=$2`,[url,'notused']);
         console.log(result);
            if(result.rowCount){
            const salt = randomBytes(16).toString("hex");
            let hashedpassword = scryptSync(password, salt, 64).toString("hex");
            hashedpassword = `${salt}:${hashedpassword}`;
            let updatepassword = await pool.query(`update users set
               password=$1 where  user_id=$2 `,[hashedpassword,user_id])
               console.log(updatepassword);
               if(updatepassword.rowCount){
                console.log(result.rows[0].otp)
              let updatestatus=  await pool.query(`update otpverifyaudit set
                  status = $1 where  otp=$2 and url =$3`,['used',result.rows[0].otp,url])
                  console.log(updatepassword,updatestatus);
                  res.json({message:'reset done!',status:200})
               }
                await pool.query('COMMIT')
          }

        

          else {
            res.json({error:'reset again ',status:401})
          }
        }
        else {
          await pool.query('ROLLBACK');
          res.json({error:'something went wrong kindly contact ! '})
        }

         } catch (error) {
          console.log(error)
          await pool.query('ROLLBACK')
         }
       
  },
async  verify(req,res){
    
         const {token}=req.body
         console.log(token,'verify')
    try {
      let jwtresponse=  jwt.verify(token,process.env.SEC_KEY);
      
      if(jwtresponse.userid){
           let sqlStatement  =  `select email,roles from users where user_id =$1`
           let result = await pool.query(sqlStatement,[jwtresponse.userid])
           console.log(result);
          if(result.rowCount){
            const {email,roles}=result.rows[0]  
            const data = {token,email,roles}
   res.json({response:data,status:200})
          }
      }
  
    } catch (error) {
       res.json({error:'invalid authorization',status:401}) 
    }

  },
  async adddoctor(req,res){
      const {name,fullname,email,password,roles,department}=req.body
      
      try {
          await Validation.validateAsync(req.body)
      
        await pool.query('BEGIN')
        let result = await pool.query(
          `select email from users where email ilike $1`,
          [email]
        );
        if (result.rowCount) {
          res.json({ error: `user ${result.rows[0].email} already exists` });
          return;
        }

                 let user_id = await uniqueuserid(2,8);
                 const salt = randomBytes(16).toString("hex");
                 let hashedpassword = scryptSync(password, salt, 64).toString("hex");

             

                   hashedpassword = `${salt}:${hashedpassword}`;
                   console.log([
                    user_id,name,fullname,email,hashedpassword,roles,department
                   ])
                 let registration  = `insert into users (user_id,name,fullname,email,password,created_at,roles)
                 values ($1,$2,$3,$4,$5,$6,$7)
                 `

                 let response = await pool.query(registration,[user_id,name,fullname,email,hashedpassword,'now()',roles])
        
                  if(response.rowCount){
                     const token = jwt.sign({ userid:user_id }, process.env.SEC_KEY, {
                      expiresIn: "1h",
                    });
                    let docotortablesql = `insert into doctor (doctor_id,user_id,name,fullname,department) values($1,$2,$3,$4,$5)`
                    let saveresponse = await pool.query(docotortablesql,[user_id,user_id,name,fullname,department])
                    if(saveresponse.rowCount)  res.json({message:'successfully added',status:200,token:token})
                  } 
                  await pool.query('COMMIT')
      } catch (error) {
        console.log(error); 
        // console.log(error.details)
        // console.log(error.details.map(item=>item.message)+"");
        if(error.details!=undefined && error.details.length){
         res.json({error: error.details.map(item=>item.message)+""})
        }
         
        else{
        res.json({response:'something went wrong',status:500})
        }
        await pool.query('ROLLBACK')
      }
  },
  async adddoctoremployee(req,res){
          const {userid}=req.user
          console.log(userid);
          const {
            name,
            fullname,
            email,
            password,
            roles,
            joiningdate,
            department,
            lastdate,
            fees,
          } = req.body;
     try {
       await pool.query('BEGIN')
      let resultsql  = `select * from users where user_id=$1 and roles =$2 or roles =$3`
      let result = await pool.query(resultsql,[userid,'Doctor','Associate Doctor']);
      console.log(result); 

           
      if(result.rows[0].user_id!==''){



        //  check for email exist 

        let userchecksql = `select email from users where email =$1`
        let usercheck = await pool.query(userchecksql,[email])
            console.log(usercheck.rows,'emailssss...');
        if(usercheck.rows.length && usercheck.rows[0].email){
          res.status(200).json({message:'User already exists'})
          return;
        }

        const salt = randomBytes(16).toString("hex");
        let hashedpassword = scryptSync(password, salt, 64).toString("hex");
        let uniqueId = await uniqueuserid(2, 8);
        // console.log(`${salt}:${hashedpassword}`);
        hashedpassword = `${salt}:${hashedpassword}`;
 

        let userResult = await pool.query(
          `insert into users (user_id,name,fullname,email,roles,password,created_at)
                              values($1,$2,$3,$4,$5,$6,$7) returning user_id `,
          [uniqueId, name, fullname, email, roles, hashedpassword, 'now()']
        );

      console.log(userResult);
 
      if(userResult.rowCount){

      
      let re=  await pool.query(
          `insert into doctor (doctor_id,user_id,name,fullname,department,joiningdate,lastdate,fees)
             values($1,$2,$3,$4,$5,$6,$7,$8) returning doctor_id`,
          [userid,userResult.rows[0].user_id,name, fullname, department, joiningdate, lastdate, fees]
        );
       res.json({result:re})
      }
      await pool.query('COMMIT')
      }
      else {
        res.status(200).json({message:'error cant add employee'})
        return;
      }
     } catch (error) {
      await pool.query('ROLLBACK')
      console.log(error)
      res.json({error:error})
     }
  },
  async getprofiledetails(req,res){
    const {userid}=req.user
   console.log(req.session)
    
  try {
    let getprofilesql = `select name,fullname,email from users where user_id =$1`
    let getprofile = await pool.query(getprofilesql,[userid])

    if(getprofile.rowCount){

      res.json({response:getprofile.rows[0],status:200})
    }
  } catch (error) {
    res.json({error:error})
  }
  },
  async updateprofile(req,res){
    const {name,fullname,email}=req.body
    const {userid}=req.user
    try {
       let updatesql = `update users set name=$1, fullname=$2, email=$3 where user_id=$4 `
       let updateresult = await pool.query(updatesql,[email,fullname,email,userid])
       if(updateresult.rowCount){
        res.json({response:'successfully updated',status:200})
       }
       else {
        res.json({response:'can not  update right now',status:500})
       }
    } catch (error) {
      console.log(error);
    }
  },
  logout: function (req, res) {
    // console.log(req.session);
    if (req.session.userID) {
      req.session.destroy((err) => {
        if (err) {
          return res.json({ error: "Logout failed", status: 500 });
        }
        res.json({ message: "Logout successful", status: 200 });
      });
    } else {
      res.json({ error: "No active session found", status: 401 });
    }
  },



};

module.exports = User;
 