const express = require('express');
const router = express.Router();
const User = require('../controller/auth')
router.post('/register',User.register);
router.post('/login',User.login);
router.post('/generateotp',User.generateotp)
router.post('/verifyotp',User.verifyotp)
router.post('/resetpassword',User.changepassword)
router.post('/verify',User.verify)
router.post('/adddoctor',User.adddoctor)
router.post('/addemployee',User.auth,User.adddoctoremployee)
router.get('/getprofile',User.auth,User.getprofiledetails)
router.post('/profileupdate',User.auth,User.updateprofile)
router.get('/logout',User.logout)
router.get('/verify',User.auth);
module.exports=router;
