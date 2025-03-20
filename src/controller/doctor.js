const pool = require("../config/db");
const bookingID = require("../../utils/uniquegen");
const dayjs = require("dayjs");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const { error } = require("../../utils/validator");
const BookingEmail = require("../emails/bookingstatusemail");
const { Resend } = require("resend");
const ResendEmail = require("../emails/config");
const Doctor = {
  async booking(req, res) { 
    console.log("booking");
    console.log(req.body, req.user);
    const { slottime, doctor_id, payment_status, email, date, mode } = req.body;
    let time = dayjs(date).subtract(1, "D");
    console.log(time.format("DD-MM-YYYY"), date); 
    const booking_id = await bookingID(3, 9);
    const getemailsql = `select user_id from users where email =$1`;
    const getemail = await pool.query(getemailsql, [email]);
    console.log(getemail,'EMAIL');
    const { user_id } = getemail.rows[0];
    if (getemail.rows[0].user_id) {
      let checkbookingalreadysql = `select user_id from patient where to_char(booking_date,'DD-MM-YYYY')=$1 and doctor_id=$2 and user_id=$3`;

      let checkbookingalready = await pool.query(checkbookingalreadysql, [
        time.format("DD-MM-YYYY"),
        doctor_id,
        user_id,
      ]);

      console.log(checkbookingalready.rows);
      if (checkbookingalready.rowCount) {
        res.json({
          error: "booking already present on this day ",
          status: 400,
        });
        return;
      } else {
        const sqlStatement = `
        insert into patient (patient_id,slottime,user_id,doctor_id,payment_status,booking_id,created_at,booking_date,mode)
                    values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `;
        console.log(sqlStatement); 
        let result = await pool.query(sqlStatement, [
          user_id,
          slottime,
          user_id,
          doctor_id,
          payment_status,
          booking_id,
          "now()",
          date,
          mode,
        ]);
        if (result.rowCount){
          res.json({ response: "booking done!!", status: 200 });
    
        }
      }
      console.log(booking_id);
    }
  },
  async getBookingDetails(req, res) {
    const doctor_id = req.user.userid;
    console.log(req.user, "USERS", doctor_id);
    let sqlStatement = `
SELECT 
   u1.user_id ,u1.fullname,
    d.doctor_id  as doctor_id,
    p.* as pdetails
   FROM 
    patient p
    INNER JOIN doctor d ON p.doctor_id = d.user_id 
    INNER JOIN users u1 ON p.user_id = u1.user_id  -- Join for patient's user details
    where p.doctor_id = $1
    `;
    let result = await pool.query(sqlStatement, [doctor_id]);
  
    if (result.rowCount) res.json({ response: result.rows, status: 200 });
    else { res.json({ response: "no booking available", status: 200 })};
  },
  async add(req, res) {},
  async getdoctorList(req, res) {
    const doctor_id = req.user.userid;
   console.log(doctor_id,'line 82');
    //  getting doctor id of users

    let getrolessql = `select roles from users where user_id=$1`;
    let getroles = await pool.query(getrolessql, [doctor_id]);

    if (getroles.rows[0].roles !== "Patient") {
      let getallassociatesql = `
select  
d.doctor_id,d.department ,d.notavailable ,d.joiningdate ,d.lastdate ,d.fees ,
u.roles as roles,u.fullname,u.user_id ,u."name" 
from doctor d 
inner join users u 
on u.user_id  = d.user_id 
where doctor_id in (
select  doctor_id from doctor d  where 
d.user_id = $1
)
      `;
      let getallassociate = await pool.query(getallassociatesql,[doctor_id])
      res.json({ response: getallassociate.rows });
      return;
    }
    console.log(doctor_id, "doctor_id");
    // const verifytoken =   jwt.verify(token, process.env.SEC_KEY);
    // console.log(verifytoken);
    let sqlStatement = `select  * from users u
inner join doctor d  on u.user_id = d.user_id
 where d.doctor_id = $1 
 order by u.id asc
 `;
    let result = await pool.query(sqlStatement, [doctor_id]);
    console.log(result, "getdoctorlist"); 
    res.json({ response: result.rows });
  },
  async udatedoctorDetails(req, res) {
    console.log(req.body, "body");
    const {
      user_id,
      name,
      fullname,
      department,
      lastdate,
      fees,
      notavailable,
    } = req.body;
    try {
      let sqlStatement = ` update doctor
       set name =$1 ,fullname = $2, department=$3 ,lastdate =$4 , fees =$5 ,notavailable =$6
        where user_id = $7
      `;
      let result = await pool.query(sqlStatement, [
        name,
        fullname,
        department,
        lastdate,
        fees,
        notavailable,
        user_id,
      ]);

      if (result.rowCount) res.json({ status: 200 });
    } catch (err) {
      console.log(err);
    }
  },
  async getbookedslottime(req, res) {
    const { date, doctor_id } = req.body;
    console.log(date);
    let getbookedslottimesql = `select slottime from patient where to_char(booking_date,'DD-MM-YYYY')=$1 and doctor_id=$2`;
    let getbookedslottimes = await pool.query(getbookedslottimesql, [
      date,
      doctor_id,
    ]);
    console.log(getbookedslottimes);

    res.json({ data: getbookedslottimes.rows });
  },
  async getalldoctor(req, res) {
    let alldoctorsql = `select 
    d.*,
    u.roles as roles
    from doctor d
    inner join users u 
    on d.user_id = u.user_id
    where u.roles <> 'Associate' and u.roles <> 'Associate Doctor'
    `;
    let alldoctor = await pool.query(alldoctorsql);

    if (alldoctor.rowCount) {
      res.json({ response: alldoctor.rows });
    }
  }, 
  async bookingstatus(req, res) {
    const { booking_id, status } = req.body;
    console.log(req.body);
    try {
      let bookingstatussql = `update  patient 
      set booking_status=$1
      where booking_id = $2
      `;
      let bookingstatus = await pool.query(bookingstatussql, [
        status,
        booking_id,
      ]);

      console.log(bookingstatus);
      if (bookingstatus.rowCount) {
     
        let getbookingdetailsSql= `
select  
p.booking_status,p.slottime,p.user_id,p.doctor_id,p.booking_date, 
u.user_id, u."name" as patientname,u.email as patientemail ,
d.* as ddata
from patient p 
inner join users u 
on u.user_id =p.user_id 
inner join doctor d 
on d.user_id =p.doctor_id 
where p.booking_id =$1
        ` 
        let getbookdeatils = await pool.query(getbookingdetailsSql,[booking_id])
        if(getbookdeatils.rows){
          let {booking_status,slottime,patientname,fullname,department,booking_date,patientemail} =  getbookdeatils.rows[0]
       let emailTemplate =   BookingEmail({patientname,fullname,booking_date,slottime,booking_status,department})
     let result =  await ResendEmail(emailTemplate,'rajatkumar108@hotmail.com','Booking Details')
     console.log(result)
     if(result.error==null){
      res.json({ response: "update successfully", status: 200 });
     }
        }
      }
    } catch (error) {
      await pool.query('ROLLBACK')
      console.log(error);
      res.json({ error: "update failed!", status: 500 });
    }
  },
  async patientdetails(req, res) {
    const { userid } = req.user;
    try {
      let getdetailssql = `select 
  
  d.*  as ddetails,
  p.* as pdetails
from patient p
inner join doctor d on d.user_id = p.doctor_id
where p.patient_id  = $1 
order by  booking_date desc
`;
      let getpatientdetails = await pool.query(getdetailssql, [userid]);
      console.log(userid, getpatientdetails);
      if (getpatientdetails.rowCount) {
        res.json({ response: getpatientdetails.rows, status: 200 });
      }
    } catch (error) {}
  },
  async cancelappointment(req, res) {
    const { booking_id } = req.body;

    try {
      const { userid } = req.user;

      let updatestatussql = `update patient set booking_status =$1 where booking_id=$2
      returning booking_id
      `;

      let updateresult = pool.query(updatestatussql, ["cancelled", booking_id]);

      if ((await updateresult).rowCount) {
        res.status(200).json({ response: "successfully updated" });
      } else {
        res.status(400).json({ error: "can not updated write now" });
      }
    } catch (error) {
      res.status(500).json({ error: "can not updated write now" });
    }
  },

  async getdoctordetails(req,res){
         const {doctor_id}=req.body
     try {
      let doctordetailssql=`select * from doctor where user_id =$1`
      let docotortableresult = await pool.query(doctordetailssql,[doctor_id])
      if(docotortableresult.rows){
        res.status(200).json({response:docotortableresult.rows[0]})
      }
      else {
        res.status(401).json({error:'unauthorized access'})
      }
     } catch (error) {
      res.status(500).json({error:'unauthorized access'})
     }
  }

};

module.exports = Doctor;
