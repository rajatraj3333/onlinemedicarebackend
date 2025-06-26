const pool = require("../config/db");
const bookingID = require("../../utils/uniquegen");
const dayjs = require("dayjs");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const { error } = require("../../utils/validator");
const BookingEmail = require("../emails/bookingstatusemail");
const { Resend } = require("resend");
const ResendEmail = require("../emails/config");
const generateNumber = require("../../utils/uniquegen");
const Doctor = {
  async booking(req, res) {
    console.log("booking");
    // console.log(req.body, req.user);
    const { slottime, doctor_id, payment_status, email, date, mode } = req.body;
    // let time = dayjs(date).subtract(1, "D");
    // console.log(time.format("DD-MM-YYYY"), date);
  
    //    let formatteddate =date.split('/') ;
    // let formatedday =  formatteddate.length && formatteddate[0]?.length<2?+"0"+formatteddate[0]:formatteddate[0]
    // let formatedmonth = formatteddate.length && formatteddate[1]?.length<2?+"0"+formatteddate[1]:formatteddate[1]
    // let formattedyear = formatteddate.length  && formatteddate[2]
    // // let afterformated =  `${formatedday}-${formatedmonth}-${formattedyear}` 
    // let afterformated =  new Date(formattedyear,formatedmonth-1,formatedday+1).toISOString()

    // console.log(afterformated,"AFTER")
    const booking_id = await bookingID(3, 9);
    const getemailsql = `select user_id from users where email ilike $1`;
    const getemail = await pool.query(getemailsql, [email]);
    console.log(getemail,'EMAIL');
    const { user_id } = getemail.rows[0];
    if (getemail.rows[0].user_id) {
      let checkbookingalreadysql = `select user_id from patient where to_char(booking_date,'DD-MM-YYYY')=$1 and doctor_id=$2 and user_id=$3`;

      let checkbookingalready = await pool.query(checkbookingalreadysql, [
        date,
        doctor_id,
        user_id,
      ]);

      // console.log(checkbookingalready.rows);
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
        // console.log(sqlStatement);
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
        if (result.rowCount) {
          res.json({ response: "booking done!!", status: 200 });
        }
      }
      // console.log(booking_id);
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
    else {
      res.json({ response: "no booking available", status: 200 });
    }
  },
  async add(req, res) {},
  async getdoctorList(req, res) {
    const doctor_id = req.user.userid;
   
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
      let getallassociate = await pool.query(getallassociatesql, [doctor_id]);
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

    let formatteddate = date.split("T")[0].split("-");

    let formatedday =
      formatteddate.length && formatteddate[2]?.length < 2
        ? +"0" + formatteddate[2]
        : formatteddate[2];  
    let formatedmonth =
      formatteddate.length && formatteddate[1]?.length < 2 
        ? +"0" + formatteddate[1]
        : formatteddate[1];
    let formattedyear = formatteddate.length && formatteddate[0];
    let afterformated = `${formatedday}-${formatedmonth}-${formattedyear}`;

    let getbookedslottimesql = `select slottime from patient where to_char(booking_date,'DD-MM-YYYY')=$1 and doctor_id=$2 and (booking_status  in ('approved','rejected') or booking_status is null)  `;

    let getbookedslottimes = await pool.query(getbookedslottimesql, [
      afterformated,
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
        let getbookingdetailsSql = `
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
        `;
        let getbookdeatils = await pool.query(getbookingdetailsSql, [
          booking_id,
        ]);
        if (getbookdeatils.rows) {
          let {
            booking_status,
            slottime,
            patientname,
            fullname,
            department,
            booking_date,
            patientemail,
          } = getbookdeatils.rows[0];
          let emailTemplate = BookingEmail({
            patientname,
            fullname,
            booking_date,
            slottime,
            booking_status,
            department,
          });
          let result = await ResendEmail(
            emailTemplate,
            "rajatkumar108@hotmail.com",
            "Booking Details"
          );
          console.log(result);
          if (result.error == null) {
            res.json({ response: "update successfully", status: 200 });
          }
        }
      }
    } catch (error) {
      await pool.query("ROLLBACK");
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
      // console.log(userid, getpatientdetails);
      if (getpatientdetails.rowCount) {
        res.json({ response: getpatientdetails.rows, status: 200 });
      }
    } catch (error) {}
  },
  async cancelappointment(req, res) {
    const { booking_id, date } = req.body;

    let todayday = +date?.split("/")[0];
    let todaymonth = +date?.split("/")[1];
    let todayyear = +date?.split("/")[2];

    try {
      const { userid } = req.user;

      // match the date from  given date

      let statement1 = `select booking_date from patient where booking_id = $1`;

      let result = await pool.query(statement1, [booking_id]);
      console.log(result,'SELECT BOOK_DATE');

console.log(new Date(result.rows[0].booking_date).toLocaleDateString().split('/'))
     

if (result.rowCount) {
        let data = result.rows[0].booking_date;

// [ '30', '6', '2025' ]
let formatteddate = new Date(result.rows[0].booking_date).toLocaleDateString().split('/');

// for production month,day,year

        let day = process.env.NODE_ENV==='development'?+formatteddate[0]:formatteddate[1];
        let month = process.env.NODE_ENV==='development'?+formatteddate[1]:formatteddate[0];
        let year = +formatteddate[2];

        console.log(month,'BookMonth')
        console.log(day,'BookDay')
        console.log(todaymonth,'TodayMonth')
        console.log(todayday,'TodayDay')

        if (month === todaymonth) {
          if (todayday >= day) {
            res.status(200).json({ error: "booking can not cancelled" });
            return;
          }
        }
        if (Math.max(todaymonth, month) - Math.min(todaymonth, month) > 1) {
          res.status(200).json({ error: "booking can not cancelled" });
          return;
        }

        let updatestatussql = `update patient set booking_status =$1 where booking_id=$2
      returning booking_id
      `;

        let updateresult = await pool.query(updatestatussql, [
          "cancelled",
          booking_id,
        ]);

        console.log(updateresult,'UPDATERESULT')
        if ((await updateresult).rowCount) {
          res.status(200).json({ response: "booking  cancelled" });
        }
      } else {
        res.status(400).json({ error: "booking can not cancelled " });
      }
    } catch (error) {
      res.status(500).json({ error: "some thing went wrong" });
    }
  },

  async getdoctordetails(req, res) {
    const { doctor_id } = req.body;
    try {
      let doctordetailssql = `select * from doctor where user_id =$1`;
      let docotortableresult = await pool.query(doctordetailssql, [doctor_id]);
      if (docotortableresult.rows) {
        res.status(200).json({ response: docotortableresult.rows[0] });
      } else {
        res.status(401).json({ error: "unauthorized access" });
      }
    } catch (error) {
      res.status(500).json({ error: "unauthorized access" });
    }
  },
  async addhospital(req, res) {
    try {
      const uniqueid =await generateNumber(6, 8);
      const {
        hospitalname,
        hospitalselectedname,
        hospitaladdress,
        hospitalnumber,
        hospitalnoemployee,
        
      } = req.body;
   const doctor_id = req.user.userid;
 

      let t= pool; 

      await t.query('begin');  
      const sqlStatement = `
      insert into clinic (clinic_id,clinic_name,clinic_address,clinic_phone,clinic_employee_no)
      values ($1,$2,$3,$4,$5); 
      `;

      let result = await t.query(sqlStatement, [
        uniqueid,
        hospitalname || hospitalselectedname,
        hospitaladdress,
        hospitalnumber,
        hospitalnoemployee,
       
      ]);
console.log(result);
      if (result.rowCount) {
        const sqlStatement =  `update doctor set clinic_id =$1 where doctor_id= $2;`

        console.log(uniqueid,doctor_id)
        let updateresult = await t.query(sqlStatement,[uniqueid,doctor_id]) 

        console.log(updateresult,'UPDATE')
        if(updateresult.rowCount){

          await t.query('commit'); 
          res.status(200).json({ response: "successfully created" });
        } 
        else {
          await t.query('rollback');
           res.status(200).json({ response: "cannot update right now" });
        }
      }
    } catch (error) {
      console.log(error)
      res.status(200).json({ error: "can not create right now" });
    }
  },

  async fetchhospital(req, res) {
    try {
      const { id, type } = req.body;
      if (type === "byname") {
        const sqlStatement = `select * from clinic where clinic_id =$1`;
        let result = await pool.query(sqlStatement, [id]);
        if (result.rows) {
          result = result.rows[0];
          res.status(200).json({ response: result });
        }
        else {
            res.json({ error: "no data available " });
        }
      } else if (type === "allname") {
        const sqlStatement = `select clinic_id,clinic_name from clinic;`;
        let result = await pool.query(sqlStatement);
        if (result.rows) {
          result = result.rows;
          res.status(200).json({ response: result });
        } 
      } else {
        res.status(401).json({ error: "your  request is not  valid " });
      }
    } catch (error) {} 
  },
  async updatehospital(req,res) {
    try {
      const {
        id,
        hospitalname,
        hospitaladdress,
        hospitalnumber,
        hospitalnoemployee,
      } = req.body;

      console.log(req.body, 'UPDATE HOSPITAL')
      const sqlStatement = `update clinic set  clinic_name=$1,clinic_address=$2,clinic_phone=$3,clinic_employee_no=$4
                            where clinic_id=$5      
                            `;
         let result = await pool.query(sqlStatement,[  hospitalname,
        hospitaladdress,
        hospitalnumber,
        hospitalnoemployee,
         id 
      ])
      console.log('RESULT',result); 
      if(result.rowCount){
          res.status(200).json({ response: "successfully updated" });
      }                   
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "can not update right now" });
    }
  },

  async noofemployee(req,res){
      try {
        const sqlStatement = `(select clinic_name,count(clinic_name)
                              group by clinic_name
                              `
      } catch (error) {
        
      }
  }
};

module.exports = Doctor;
