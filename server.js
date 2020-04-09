const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan'); 
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
//const logger = require('./middleware/logger')

// Load env vars
dotenv.config({path : './config/config.env'});

// connect to Database
connectDB();

// Rout files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();
//Body parser
app.use(express.json());
// Cookie parser middleware
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// File upload
app.use(fileupload());
// Mongo Sanitize
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent cross scripting XSS
app.use(xssClean());
// Rate limiting
const limiter = rateLimit({
    windowMs : 10 * 60 * 1000,
    max : 100
})
app.use(limiter)
// Prevent http param polution
app.use(hpp());
// Enable CORS
app.use(cors());
// make public static folder
app.use(express.static(path.join(__dirname,'public')))

// Mount routes    
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT} .`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error ${err.message}`.red);
    server.close(() => process.exit(1));
})