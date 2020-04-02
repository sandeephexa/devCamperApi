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

   sendTokenResponse(user,200,res);
})

// @desc Login User
// @route POST api.v1/auth/login
// @access Public
exports.login = asynchHandler(async(req,res,next) => {
      
    const {email,password} = req.body;
    console.log(email,password);
   // Check validation
    if(!email || !password){
        return next( new errorResponse("Please provide email and password.",400));
    }
    // Check for user
    const user = await User.findOne({email}).select('+password');
    
    // Check user is autherised
    if(!user){
        return next( new errorResponse("Invalid credentials",401));
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next( new errorResponse("Invalid credentials",401));
    }
    
    sendTokenResponse(user,200,res);
})

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode,res) =>{
    // create token
    const token = user.getSignedJwtToken();
    const options = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly : true
    }

    // make cookie secured i.e HTTPS only, if it runs in production
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token',token,options).json({
        success : true,
        token
    })
}

// @desc get loggged in User
// @route POST api.v1/auth/me
// @access Private
exports.getMe = asynchHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success : true,
        data : user
    })
})