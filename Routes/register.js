module.exports = (register) => {
    register.get('/', (req, res) => {
        res.sendFile('/home/tonystark/Desktop/JS/Zomato-Restaurants/views/register.html')
    })
}