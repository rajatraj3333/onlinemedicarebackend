const express = require('express');
const { getalldoctor, bookingstatus, patientdetails, cancelappointment, getdoctordetails } = require('../controller/doctor');
const router = express.Router();
const auth = require('../controller/auth').auth
const create = require('../controller/doctor').add
const booking = require('../controller/doctor').booking
const bookingDetails = require('../controller/doctor').getBookingDetails
const getdoclist = require('../controller/doctor').getdoctorList
const updatedoctorlist = require('../controller/doctor').udatedoctorDetails
const bookedslottime = require('../controller/doctor').getbookedslottime
const addhospital = require('../controller/doctor').addhospital
const fetchhospital = require('../controller/doctor').fetchhospital
const updatehospital = require('../controller/doctor').updatehospital


// Route 
router.get('/add',auth,create);
router.post('/book',auth,booking)
router.get('/bookingdetails',auth,bookingDetails);
router.get('/getdoctorlist',auth,getdoclist)
router.post('/updatedoctordetails',auth,updatedoctorlist)
router.post('/bookslottime',bookedslottime)
router.get('/getalldoctor',getalldoctor)
router.post('/getdoctordetails',auth,getdoctordetails)
router.post('/bookingstatus',auth,bookingstatus)
router.get('/getpatientdetails',auth,patientdetails)
router.post('/cancelappointment',auth,cancelappointment)
router.post('/addnewhospital',auth,addhospital)
router.post('/fetchhospital',fetchhospital)
router.put('/updatehospital',auth,updatehospital)
// router.get('/noofemployee',auth,noofemployee)

module.exports=router; 
  