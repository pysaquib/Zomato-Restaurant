module.exports = (user, jwt, nodemailer, knex) => {
    var dotenv = require("dotenv")
    dotenv.config();                                    //Configuring .env
    var Promise = require("promise")
    var sentOTP = 0;
    const configKey = 'ZOM8uy92';
    var accessToken = "";
    var userDetails = {};
    var zomatoJS = require("zomato.js")
    var z = new zomatoJS("aa7ye969yd3269854223da")
    var nodeGeo = require("node-geocoder")
    var options = {
        provider : 'opencage',                                    //Geolocation provider(opencage/mapquest)
        httpAdapter : 'https',
        apiKey : "6ec1c06395f0c6e4048902384e644cab",               //Api Key provided by geolocation provider
        formatter : null
    }
    var geocoder = nodeGeo(options)
    
    const verifyToken = (req, res, next) => {
        const bearerHeader = req.cookies;
        if(typeof(bearerHeader!=='undefined')){
            var bearer = bearerHeader.split(" ")
            req.cookies = bearer[1]
            next();
        }
        else{
            res.sendStatus(403)
        }
    }
    
    user.post('/signup', (req, res) => {
        var user = {
            'name' : req.body.name,
            'email' : req.body.email,
            'password' : req.body.password
            }
        userDetails = user;
        var oneTimePass = Math.floor((Math.random()*(999999-100000))+100000)
        sentOTP = oneTimePass;
        if(req.body.password === req.body.password_2){
            knex('Users').select('Email').where('Email', user['email']).then((data)=>{
                if(data.length>0){
                    res.send("User already exists. Click <a href=\"http://127.0.0.1:8008/user/userLogin\">here</a> to login.")
                }
                else{
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        secure: false,
                        port : 25,
                        auth: {
                            user : "ENTER YOUR EMAIL",
                            pass : "ENTER YOUR PASSWORD"
                        },
                        tls: {
                            rejectUnauthorized:false
                        }
                    });
                    var mailOptions = {
                        from : "ENTER YOUR EMAIL",
                        to : req.body.email.toString(),
                        subject : "Zomato OTP",
                        text : "Your OTP is "+oneTimePass
                    };
                    if(transporter.sendMail(mailOptions)){
                        res.sendFile('/home/tonystark/Desktop/JS/Zomato-Restaurants/views/otp.html')
                    }
                    else{
                        res.send("Couldn't send OTP.")
                    }
                }
            })
        }
        else{
            res.send("Passwords do not match")
        }
    })
    
    user.post('/verify', (req, res) => {
        var enteredOTP = req.body.otp;
        if(enteredOTP==sentOTP){
            userDetails['CreatedOn'] = new Date()
            console.log(userDetails)
            knex('Users')
            .insert(userDetails)
            .then(()=>{
                res.sendFile("/home/tonystark/Desktop/JS/Zomato-Restaurants/views/login.html")
            })
        }
        else{
            res.sendFile("/home/tonystark/Desktop/JS/Zomato-Restaurants/views/otp.html")
        }
    })


    user.get('/userLogin' ,(req, res) => {
        res.sendFile("/home/tonystark/Desktop/JS/Zomato-Restaurants/views/login.html")
    })

    user.post('/login', (req, res) => {
        var user = {
            'email' : req.body.email,
            'password' : req.body.password
        }
        knex('Users').select('*').where({'Email': user['email']}).orWhere({'Password' : user['password']})
        .then((data) => {
            if(data[0]['Password']==user['password']){
                jwt.sign({user}, configKey, {'expiresIn':'1h'}, (err, token)=>{
                    if(!err){
                        // res.clearCookie('jwt')
                        res.cookie('jwt', token)
                        res.render('search')
                    }
                })
            }
            else{
                res.json("Wrong Credentials")
            }
        })
        .catch((err)=>{
            res.json("User doesn't exist")
        })
    })

    user.post('/search', (req, res) => {
        var cityName = req.body.city
        var token = req.cookies['jwt']
        jwt.verify(token, configKey, (err, data) => {
            if(!err){
                geocoder.geocode(cityName)
                .then((data)=>{
                    var [lati, long] = [0, 0];
                    lati = (data[0]["latitude"])
                    long = (data[0]["longitude"])
                    z.geocode({
                        lat : lati,
                        lon : long
                    })
                    .then((data_2) => {
                        var rest = []
                        var address = []
                        let i = (data_2["popularity"]["nearby_res"]).length
                        for(let j = 0; j < i; j++){
                            rest.push(data_2["nearby_restaurants"][j]["restaurant"]["name"])
                            address.push(data_2["nearby_restaurants"][j]["restaurant"]["location"]["address"])
                        }
                        res.render('restaurants', {r : rest, a : address})
                    })
                    .catch((err2)=>{
                        res.send(err2)
                    })  
                })
                .catch((err)=>{
                    res.send("Data doesn't exist")
                })
            }
            else{
                res.send(err)
            }
        })
    })
}