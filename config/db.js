const mongoose = require("mongoose");

mongoose.set('useUnifiedTopology', true);
const connectDB = async () =>{
    var conn =  await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser : true,
        useCreateIndex : true,
        useFindAndModify : false
        // useUinifiedTopology : true
    });

        console.log(`MongoDB Connected on ${conn.connection.host}`.cyan.underline.bold);
}

module.exports = connectDB;