module.exports = (page, zomatoApi) => {
    
    var zomatoJS = require("zomato.js")
    var z = new zomatoJS("de629a7a976e9697050014e9856234e4")
    
    // node-geocoder is a NodeJS library that provides geolocation
    var nodeGeo = require("node-geocoder")
    var options = {
        provider : 'opencage',                          //Geolocation provider(opencage/mapquest)
        httpAdapter : 'https',
        apiKey : "34cab6ec1e644048902c07995f0c0e84",    //Api Key provided by geolocation provider
        formatter : null
    }
    var geocoder = nodeGeo(options)
    
    page.get('/', (req, res) => {
        res.render('search')                            //Renders /views/search.ejs  file
    })

    page.post('/search', (req, res) => {
        var cityName = req.body.city
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
                console.log(req)
                res.render('restaurants', {r : rest, a : address})
            })
            .catch((err2)=>{
                res.send(err2)
            })  
        })
        .catch((err)=>{
            console.log(err)
        })
    })
}