const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// @desc update User
// @route PUT api.v1/auth/updatedetails
// @access Private
exports.updateDetails = asynchHandler(async (req,res,next) => {
    const fieldsToUpdate = {
        name : req.body.name,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new : true,
        runValidators : true
    });

    res.status(200).json({
        success : true,
        data : user
    })
})

// @desc Update Password
// @route POST api.v1/auth/updatepassword
// @access Private
exports.updatePassword = asynchHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next( new errorResponse("Current password not matching",401));
    }
    user.password = req.body.newPassword;
    await user.save();
    
    sendTokenResponse(user,200,res)
})

// @desc Forgot password
// @route POST api.v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asynchHandler(async (req,res,next) => {
    const user = await User.findOne({email : req.body.email});
    // Check for user
    if(!user){
        return next( new errorResponse(`No user found with email ${req.body.email}`,404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave : false})
    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
    const text = `You are receiving this message, because you've requested for password reset. Please make a PUT request to ${resetURL}`

    try {
        await sendEmail({
            email : user.email,
            subject : 'Reset Password',
            text
        })

        res.status(200).json({
            success : true,
            data : 'Email Sent'
        })
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave : false})
        
        return next(new errorResponse("Email couldn't be sent",500))
    }
    // res.status(200).json({
    //     success : true,
    //     data : user
    // })
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