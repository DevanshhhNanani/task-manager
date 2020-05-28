const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')

router.post('/users', async (req, res) => {
    const user = new User (req.body)

    try{
        await user.save()
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
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router