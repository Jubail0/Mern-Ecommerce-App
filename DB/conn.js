const mongoose = require('mongoose')
const DB = process.env.DATABASE;

mongoose.connect(DB).then(()=>{
    console.log('Connection successfull')
}).catch(()=>console.log('No connection'))