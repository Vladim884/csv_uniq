const jwt = require("jsonwebtoken")
const config = require('config')
let alert = require('alert')

exports.cookieJwtAuth = (req, res, next) => {
    // module.exports = (req, res, next) => {
   const token = req.cookies.token
//    if (!token) {
//     return res.sendStatus(403);
//    }
   try {
       //the important part
       const user = jwt.verify(token, config.get('secretKey'))
       req.user = user
       next()
   } catch (err) {
       console.log(err)
       res.clearCookie('token')
       alert('Время сессии истекло, пожалуйста, выполните вход')
       res.redirect('/')
   }
}