const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const User = require('../models/User');

// @desc Get All Users
// @route GET api.v1/auth/users
// @access Private/Admin
exports.getUsers = asynchHandler(async(req,res,next) => {
      
   res.status(200).json(res.advancedResults);
})

// @desc Get Single User
// @route GET api.v1/auth/users/:id
// @access Private/Admin
exports.getUser = asynchHandler(async(req,res,next) => {
      
    const user = await User.findById(req.params.id);
    res.status(200).json({
        success : true,
        data : user
    });
 })

// @desc Create User
// @route POST api.v1/auth/users
// @access Private/Admin
exports.createUser = asynchHandler(async(req,res,next) => {
      
    const user = await User.create(req.body);
    res.status(201).json({
        success : true,
        data : user
    });
 })

// @desc Update User
// @route PUT api.v1/auth/users
// @access Private/Admin
exports.updateUser = asynchHandler(async(req,res,next) => {
      
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new : true,
        runValidators:true
    });
    res.status(200).json({
        success : true,
        data : user
    });
 })

// @desc Delete User
// @route DELETE api.v1/auth/users
// @access Private/Admin
exports.deleteUser = asynchHandler(async(req,res,next) => {
      
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success : true,
        data : {}
    });
 })