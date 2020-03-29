const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan'); 
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
//const logger = require('./middleware/logger')

// Load env vars
dotenv.config({path : './config/config.env'});

// connect to Database
connectDB();

// Rout files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// File upload
app.use(fileupload());
// make public static folder
app.use(express.static(path.join(__dirname,'public')))

// Mount routes    
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT} .`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error ${err.message}`.red);
    server.close(() => process.exit(1));
})