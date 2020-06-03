const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, sendCancellationEmail } = require('../account')

router.post('/users', async (req, res) => {
    const user = new User (req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.token = req.user.token.filter((token) =>{
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.token = []
        await req.user.save()

        res.status(201).send()
    } catch (e) {
        res.status(500).save()
    }
})

router.post('/users/login', async (req,res) =>{
    try{
        const user = await User.findbyCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }
    catch(e){
        res.send("Unable to login")
    }
})


// This route will show the details of the user currently signed in
router.get('/users/me',auth, async(req,res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async(req,res)=>{

    const updates = Object.keys(req.body)
    const AllowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) => AllowedUpdates.includes(update))

    if (!isValidOperation){
        res.status(400).send({error : "Invalid Operation "})
    }
    try{

        
        updates.forEach((update) => { req.user[update] = req.body[update]})
        

        await req.user.save()
        
        res.send(req.user)
    }
    catch(e){
        res.status(400).res.send(e)
    }

})

router.delete('/users/me',auth, async(req,res)=>{
    try{
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }
    catch(e){
        res.status(501).send(e)
    }
})

// Creating middleware for uploading avatar (multer)
const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(jpeg|png|jpg)$/)){
            return callback(new Error('Please upload a image'))
        }
        
        callback(undefined, true)
    }
})

// Route of creating a avatar and also updating it
router.post('/users/me/avatar',auth,  upload.single('avatar'), async(req, res) =>{
    if(!req.file){
        res.status(404).send("Please attach a image")
    }
    // Below given line will convert any file type of png and resize it to our given dimensions
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=> {
    res.status(400).send((error.message))
})

// Route of delete avatar of a user if it already exists
router.delete('/users/me/avatar', auth, async(req, res)=>{
    if(!req.user.avatar){
        res.status(400).send('No avatar found on profile')
    }
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Route to fetch avatar
router.get('/users/:id/avatar',async( req,res)=>{
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send()
    }
})
module.exports = router