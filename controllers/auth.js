const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const User = require('../models/User');

// @desc Register User
// @route POST api.v1/auth/register
// @access Public
exports.register = asynchHandler(async(req,res,next) => {
      
    const {name,password,role,email} = req.body;
    const user = await User.create({
    name,
    password,
    email,
    role}
);


    res.status(200).json({
           success : true
       })
})