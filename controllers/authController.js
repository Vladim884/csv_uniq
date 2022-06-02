const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const nodemailer = require("nodemailer")
const {check, validationResult} = require("express-validator")


exports.signup = async (req, res) => {
    
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        console.log(req.body)
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if(candidate) {
            return res.status(400).json({message: `Пользователь с email: ${email} уже существует`})
        }
        const token = jwt.sign({email, password}, config.get('JWT_ACC_ACTIVATE'), {expiresIn: 60 * 60})
        
        console.log(token)

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.get('EMAIL'),
                accessToken: config.get('ACCESSTOKEN'),
                refreshToken: config.get('REFRESHTOKEN'),
                clientId: config.get('CLIENTID'),
                clientSecret: config.get('CLIENTSECRET'),
                accessUrl: config.get('ACCESSURL')
            }
        })
        
        const mailOptions = {
            from: config.get('EMAIL'), // sender address
             to: 'ivladim95@gmail.com', // list of receivers
            subject: 'ACTIVATE YOUR ACCOUNT',
            html: `
                <h4>Кликните на ссылку для активации Вашего аккаунта</h4>
                <p>${config.get('CLIENT_URL')}/api/auth/activate?token=${token}</p>
                `
        }
        
        transporter.sendMail(mailOptions, function (err, info) {
            if(err) console.log(err)
            console.log(info);
            return res.json({message: `Вам отправлено письмо активации на ${email}, активируйте свой аккаунт.`})
        })

    } catch(err) {
        console.log(err)
    }
}
    
exports.activateAccount = async (req, res) => {
    const token = req.body.name
    if (token) {
        const {email, password} = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        console.log(email)
        console.log(password)
    try {
        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({email, password: hashPassword})
        await user.save()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.get('EMAIL'),
                accessToken: config.get('ACCESSTOKEN'),
                refreshToken: config.get('REFRESHTOKEN'),
                clientId: config.get('CLIENTID'),
                clientSecret: config.get('CLIENTSECRET'),
                accessUrl: config.get('ACCESSURL')
            }
           });
           
           const mailOptions = {
             from: config.get('EMAIL'), // sender address
             to: 'ivladim95@gmail.com', // list of receivers
             subject: 'Регистрация на CSV-UNIQ.',
             text: `
             Спасибо, что Вы зарегистрировались на CSV-UNIQ!
             ===============================================
             Ваши 
             логин: ${email} 
             пароль: ${password}
             Сохраните эти данные в надёжном месте 
             и удалите это сообщение.
             `
           }
           
           transporter.sendMail(mailOptions, function (err, info) {
              if(err)
                console.log(err)
              else
                console.log(info);
                return res.render('./start.hbs')
        })
    } catch(err) {
        console.log(err)
        res.json({error: 'Что-то пошло не так!'})
    }
}}





 // const data = {
        //     from: 'vladim.volovenko@gmail.con',
        //     to: email,
        //     subject: 'Account Activation Link',
        //     html: `
        //         <h4>Кликните на ссылку для активации Вашего аккаунта</h4>
        //         <p>${config.get('CLIENT_URL')}/api/auth/activate?token=${token}</p>
        //         `
        // };
        
        // mg.messages().send(data, function (err, body) {
        //     if (err) {
        //         console.log('data:')
        //         return res.json({error: err.message})
        //     }
        //     return res.json({message: 'Вам отправлено письмо активации. Пожалуйста, активируйте свой аккаунт.'})
        //     console.log(JSON.stringify(body))
        // })