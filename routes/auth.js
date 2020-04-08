const express = require('express');
const {register, login, logout, getMe, forgotPassword, updateDetails, updatePassword, resetPassword } = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.post('/register',register);
router.post('/login',login);
router.get('/logout',protect,logout);
router.get('/me',protect,getMe);
router.put('/updatepassword',protect,updatePassword);
router.put('/updatedetails',protect,updateDetails);
router.post('/forgotpassword',forgotPassword);
router.put('/resetpassword/:resettoken',resetPassword);

module.exports = router; 