const mongoose = require('mongoose');

const dbconnection = ()=>{
    mongoose.connect("mongodb+srv://dhruvi1685:dhruvi123@cluster0.mw1ii.mongodb.net/Admin-panel")
    .then(()=>{
        console.log("Database connected successfully");
    }).catch((err)=>{
        console.log("Database connection error",err);
        
    })
}
module.exports = dbconnection();