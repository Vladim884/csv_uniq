const Router = require("express")
const express = require("express")
const app = express()
// const formidable = require('formidable')
const json2csv = require("json2csv");
const convertCsvToXlsx = require('@aternus/csv-to-xlsx')
const rimraf = require('rimraf')
const csv = require('csv-parser')
const alert = require('alert')
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
// const fse = require('fs-extra')
const fs = require('fs')
// const uuidv1 = require('uuidv1')
const path = require('path')
// const shell = require('shelljs');
// var mv = require('mv')

const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
// const authMiddleware = require('../middleware/auth.middleware')
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const {filePathDeleter} = require('../myFunctions/filePathDeleter')
const {deleteFolder} = require('../myFunctions/deleteFolder');
const { signup, activateAccount } = require("../controllers/authController");
// const fileService = require('../services/fileService')
// const File = require('../models/File')
let results = []

router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    signup)
   
router.post('/email-activate', activateAccount)

router.post('/login',
    async (req, res) => {
        let randFilePath = req.cookies.randFilePath // 
        let csvpath = req.cookies.csvpath
        let exelpath = req.cookies.exelpath
        let dirpath = req.cookies.dirpath //idNameFolder
        filePathDeleter(randFilePath) //randNameFile in dest-folder
        filePathDeleter(csvpath)
        filePathDeleter(exelpath)
        deleteFolder(dirpath) // delete idNameFolder
        res.clearCookie('newpath')
        res.clearCookie('cookid')
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const token = jwt.sign({id: user.id, email: user.email}, config.get("secretKey"), {expiresIn: "1h"})
            
            res.cookie('cookid', user.id)
            res.clearCookie("token")
            res.cookie('token', token, {
                httpOnly: true
            })
            // return res.json({
            //     token,
                // user: {
                //     id: user.id,
                //     email: user.email,
                //     diskSpace: user.diskSpace,
                //     usedSpace: user.usedSpace,
                //     avatar: user.avatar
                // }
            // })
            console.log(req.cookies.cookid)
            
            
            console.log(`checkbox = ${req.body.flag}`)//checkbox value on login.hbs
            if (req.body.flag) {
                return res.render('./start.hbs')
            } else {
                return res.render('./message.hbs')
            }
            
        } catch (e){
            console.log(e)
        }
    }
)


router.post('/upload', 
cookieJwtAuth, 
(req, res, next) => {
    let filedata = req.file
    console.log(filedata)
    results = []
    let resfind = []
    let resname = []
    let resgroup = []
    console.log("Cookies: ", req.cookies.cookid)
    try {
    let originalFile = filedata.originalname
    let fileExt = path.extname(originalFile)
    if(fileExt !== '.csv') return res.send('Некоректне розширення файлу! Поверниться на крок назад, та оберить файл с розширенням ".csv" на прикінці.')

    let dirpath = `${config.get("filePath")}\\${req.cookies.cookid}\\` // path for dir 'files/thisId' in project-folder
    let randFilePath = `${config.get("filePath")}\\${filedata.filename}` //path for  file .csv in 'dest/req.cookies.cookid' in project-folder
    res.cookie('dirpath', dirpath) // path for dir 'files/thisId' in project-folder
    res.cookie('randFilePath', randFilePath) // path for dir 'files/thisId' in project-folder

    fs.mkdirSync(`${dirpath}`, err => {
        if(err) throw err // не удалось создать папку
        console.log('Папка успешно создана');
        });
    fs.createReadStream(randFilePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', () => {

            for (let i = 0; i < results.length; i++) {
                let data_f = results[i]['Поисковые_запросы'];
                let data_n = `${results[i]['Название_позиции']} ${results[i]['Поисковые_запросы']} ${results[i]['Название_группы']}`;
                let data_g = results[i]['Название_группы'];

                resfind.push(data_f)
                resname.push(data_n)
                resgroup.push(data_g)
            }
            let req_name = resname;
            let req_group = resgroup;
            let req_find = resfind;
            res.render("upload1.hbs", {
                req_name: req_name,
                req_group: req_group,
                req_find: req_find,
                resfind: resfind,
                resname: resname,
                resgroup: resgroup
            })
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/upload1', 
    cookieJwtAuth, 
    (req, res) => {
        console.log(req.cookies.cookid)
        let dirpath = (req.cookies.dirpath)
        console.log(`${dirpath}\\newcsv.csv`)
        if(fs.existsSync(`${dirpath}\\newcsv.csv`)) {
            fs.unlinkSync(`${dirpath}\\newcsv.csv`)
            console.log('csv deleted')
        } 
        if (fs.existsSync(`${dirpath}\\newxl.xlsx`)) {
            fs.unlinkSync(`${dirpath}\\newxl.xlsx`)
            console.log('xl deleted')
        } 
        console.log('upload-func')
        /// console.log(results)
        if(!req.body) return response.sendStatus(400);
        console.log(req.body.req_find);
        //change data file
        for (let i = 0; i < results.length; i++) {
            console.log("req.body.req_find:")
            console.log(req.body.req_find[i]);
            results[i]['Поисковые_запросы'] = req.body.req_find[i];
            results[i]['Название_позиции'] = req.body.req_name[i];
            results[i]['Название_группы'] = req.body.req_group[i]
        }
        let apiDataPull = Promise.resolve(results).then(data => {
            if (!results[0]) {
                return res.render('/start.hbs')
            }
            console.log(`results[0]: ${Object.keys(results[0])}`)
            return json2csv.parseAsync(data, {fields: Object.keys(results[0])}) // right variant
        }).then(csv => {
            //==================
            let myFirstPromise = new Promise((resolve, reject) => {
                fs.writeFile(`${dirpath}\\newcsv.csv`, csv, function (err) {
                    if (err) {
                        //= return res.render('/login')
                        console.log(err)
                        throw err
                    }
                    console.log('File Saved!')
                    console.log(req.cookies.cookid)
                    //= ind++;
                    //= console.log(ind);
                    resolve("Temporary files created!")
                });
            });
            myFirstPromise.then((message)=>{
                let source = path.join(`${dirpath}`, 'newcsv.csv')
                let destination = path.join(`${dirpath}`, 'newxl.xlsx')
                
                try {
                convertCsvToXlsx(source, destination)
                } catch (e) {
                console.error(e.toString())
                }
                /// rimraf(`${dirpath}/newxl.xlsx/`+'*', function () { 
                ///     console.log('Directory ./files is empty!'); 
                ///  !! if you remove the asterisk -> *, this folder will be deleted!
                // / });
                console.log(message)
            });
        })
        
    }
)

router.post('/upload2',
    cookieJwtAuth, 
    (req, res) => {
        let dirpath = (req.cookies.dirpath)
        let randFilePath = (req.cookies.randFilePath)
        let csvpath = `${dirpath}newcsv.csv`
        let exelpath = `${dirpath}newxl.xlsx`

        res.cookie('csvpath', csvpath)
        res.cookie('exelpath', exelpath)
        

        res.download(`${dirpath}\\newxl.xlsx`, function () {
            filePathDeleter(csvpath)
            filePathDeleter(exelpath)
            filePathDeleter(randFilePath)
            // deleteFolder(dirpath)
            // rimraf(`${dirpath}` + '*', function () { 
            //         console.log('Directory for temp-files is empty!'); 
            //     // !! if you remove the asterisk -> *, this folder will be deleted!
            //     })
    })
    // return res.send('<a href="/">hello</a>')
  })

app.get("/logout", (req, res) => {
    alert('Вы вышли из системы') 
    return res
      .clearCookie("exelpath")  
      .clearCookie("token")

      .status(200)
      .json({ message: "Successfully logged out 😏 🍀" })
       
  });



    



router.get('/auth', cookieJwtAuth,
    async (req, res) => {
        try {
            const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            console.log("Server error")
            // res.send({message: "Server error"})
        }
    }
)

router.get('/enter', (req, res)=>{
    return res.render('./login.hbs')
})

router.get('/registr', (req, res)=>{
    return res.render('./registration.hbs')
})


module.exports = router