const Bootcamp = require('../models/Bootcamp');
const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc Get All Bootcamps
// @route GET api.v1/bootcamps
// @access Public
exports.getBootcamps = asynchHandler(async (req,res,next) => {
    
        res.status(200).json(res.advancedResults);
  
});

// @desc Get single Bootcamp
// @route GET api.v1/bootcamps/;id
// @access Public
exports.getBootcamp = asynchHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({
            success : true,
            data : bootcamp
        });
})

// @desc Create Bootcamp
// @route POST api.v1/bootcamps
// @access Private
exports.createBootcamp = asynchHandler(async (req,res,next) => {
       // Add user to req.body
        req.body.user = req.user.id;
        //Check for published bootcamp
        let publishedBootcamp = await Bootcamp.findOne({user : req.user.id});
        // If the user is not admin, they can only add one bootcamp
        if(publishedBootcamp && req.user.role !== "admin"){
            return next(new errorResponse(`User with ID ${req.user.id} already published a bootcamp`,400));
        }
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
          success : true,
          data : bootcamp
      });   
})


// @desc Update Bootcamp
// @route PUT api.v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asynchHandler(async (req,res,next) => {
        let bootcamp = await Bootcamp.findById(req.params.id)
    
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new errorResponse(`User ${req.user.id} not authorized to update this bootcamp`,401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true
        })

        res.status(200).json({success : true, data : bootcamp});
})

// @desc Delete Bootcamp
// @route POST api.v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asynchHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)
    
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
         // Make sure user is bootcamp owner
         if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new errorResponse(`User ${req.user.id} not authorized to delete this bootcamp`,401));
        }
        res.status(200).json({success : true, data : {}});

        bootcamp.remove();
})

// @desc Upload photo for bootcamp
// @route PUT api.v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asynchHandler(async(req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
    }
     // Make sure user is bootcamp owner
     if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new errorResponse(`User ${req.user.id} not authorized to delete this bootcamp`,401));
    }
 
    if(!req.files){
        return next(new errorResponse(`Please upload a photo`,400));
    }
    const file = req.files.file;
    // Check for image mimetype
    if(!file.mimetype.startsWith('image')){
        return next(new errorResponse(`Please upload an image file`,400));
    }
    // Check file size 
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new errorResponse(`Please upload image size less than ${process.env.MAX_FILE_UPLOAD}`,400));
    }
    // Create custome file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.log(err);
            return next(new errorResponse(`Something wrong with file upload`,500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo : file.name})

        res.status(200).json({
            success : true,
            data : file.name
        })
    });
})

// @desc GET bootcamps by radius
// @route GET api.v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asynchHandler(async(req,res,next) => {
    const { zipcode,distance } = req.params;
    // get lat , lon from geocode
    const loc = await geocoder.geocode(zipcode);
    const lon = loc[0].longitude;
    const lat = loc[0].latitude;

    // calculate radius using radians
    // divide distance by radius of earth
    // earth radius 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
         location : { $geoWithin : { $centerSphere : [ [lon , lat], radius ] }}
    });

    res.status(200).json({
        success : true,
        count : bootcamps.length,
        data : bootcamps
    })
})