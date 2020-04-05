const express = require('express');
const {register, login, getMe, forgotPassword, updateDetails, updatePassword} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.post('/register',register);
router.post('/login',login);
router.get('/me',protect,getMe);
router.put('/updatepassword',protect,updatePassword);
router.put('/updatedetails',protect,updateDetails);
router.post('/forgotpassword',forgotPassword);

module.exports = router; 