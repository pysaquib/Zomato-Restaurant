const knex = require("knex")({
    client : 'mysql',
    connection : {
        host : '127.0.0.1',
        user : 'root',
        password : '1',
        database : 'zomato' 
    }
});                                                              // Requiring knex and connecting to database

const dotenv = require("dotenv")
dotenv.config()
const express = require("express");                              // Requiring ExpressJS
const jwt = require("jsonwebtoken");                             // Requiring jsonwebtoken
const bodyParser = require('body-parser');                       // Requiring body-parser
const nodemailer = require('nodemailer');                        // Requiring nodemailer
const cookieParser = require("cookie-parser")

const app = express();                                           // Creating an instance of ExpressJS

app.set('view engine', 'ejs')                                    // Sets the templete engine to pug
app.use(express.json())                                          // Middleware to recognise incoming request as JSON object
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

var reg = express.Router();
app.use('/register', reg);

var user = express.Router();
app.use('/user', user);

var page = express.Router();
app.use('/page', page)

require('./Routes/page')(page)
require('./Routes/user')(user, jwt, nodemailer, knex)
require('./Routes/register')(reg)

var port = 8008 || process.env.PORT;
app.listen(port, ()=>{
    console.log(`Server is listening at ${port}`)
})
