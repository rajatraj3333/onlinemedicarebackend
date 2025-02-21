
const dayjs =require('dayjs')
  function  BookingEmail(value){
     const HTML = `
      
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
         <td>Bookingstatus</td>
         <td>Department</td>
    </tr>
</thead>
<tbody>
    <tr>
        <td>${value.patientname}</td>
        <td>${value.fullname}</td>
        <td>${dayjs(value.booking_date).format('DD-MM-YYYY')}</td>
        <td>${value.slottime}</td>
        <td>${value.booking_status}</td>
        <td>${value.department}</td>
        </tr>
    </tbody>
    </table>
</div>
  </body>
</html>
     `
  
     return HTML
}

module.exports= BookingEmail;