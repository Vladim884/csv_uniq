const jwt = require("jsonwebtoken")
const config = require('config')
let alert = require('alert')

exports.cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token
    console.log(`cookieJwtAuth-cookie-token ${req.cookies.token}`)
   
   if (!token) {
    res
      .clearCookie("exelpath")  
      .clearCookie("randFilePath")  
      .clearCookie("csvpath")  
      .clearCookie("dirpath")  
      .clearCookie("token")
      .clearCookie("cookid")
    return res.sendStatus(403).json({"message": "Вы не вошли в аккаунт!"})
   }
   try {
       //the important part
       const user = jwt.verify(token, config.get('secretKey'))
       req.user = user
       next()
   } catch (err) {
       console.log(`err: ${err}`)
    //    res.clearCookie('token')
       alert('Время сессии истекло, пожалуйста, выполните вход')
       res.redirect('/')
   }
}