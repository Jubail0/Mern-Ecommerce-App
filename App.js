const express = require("express")
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const cors = require('cors')




app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', `${process.env.BASE_URL}`);
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });

dotenv.config({path:'../backend/config.env'})
require('./DB/conn.js')
app.use(cors({
    origin:`${process.env.BASE_URL}`,
    methods:["GET","POST","PATCH","DELETE"]
}))

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true,limit: '50mb', parameterLimit: 50000 }));
app.use(require('./routes/product.js'))
app.use(require('./routes/Auth.js'))
app.use(require("./routes/Cart.js"))
app.use(require('./routes/Orders.js'))
app.use(require('./routes/Admin.js'))
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`)
})


