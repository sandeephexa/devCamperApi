const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect Routes
exports.protect = asyncHandler(async (req,res,next) => {
    let token;
    // Set token from Bearer token via Headers
    console.log("headers...",req.headers)
    console.log("cookies...",req.cookies)
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Set token from cookie
    else if(req.cookies.token){
        token = req.cookies.token
    }

    // Make sure token exists
    if(!token){
        return next(new errorResponse('Not authorized to access this route',401))
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();  

    } catch (error) {
        return next(new errorResponse('Not authorized to access this route',401))
    }
})

// Authorize users
exports.authorize = (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new errorResponse(`User role ${req.user.role} not authorized to access this route`,403))
        }
        next();
    }
}