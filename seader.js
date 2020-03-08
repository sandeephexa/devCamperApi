const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// load config
dotenv.config({path : './config/config.env'});

// load models
const Bootcamp = require('./models/Bootcamp');

// connect to DB
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false,
    useUinifiedTopology : true
});

// read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))

// import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)
        console.log('bootcamps imported...'.green.inverse);
        process.exit();

    } catch (error) {
        console.log(error);
    }
}

// remove data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log('bootcamps deleted...'.red.inverse);
        process.exit();

    } catch (error) {
        console.log(error);
    }
}

//
if(process.argv[2] === "-i")
{
    importData();
}else if(process.argv[2] === "-d"){
    deleteData();
}