const express = require('express')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

// Endpoint for creating new tasks
router.post('/tasks', auth, async (req,res)=>{
    
    const task =new Task({
        // Given below is a ES6 spread operator basically it's a way to copy the properties of one operator to another
        ...req.body,
        owner : req.user._id
    })

    try{
        await task.save()
        res.status(200).send(task)
    }catch(e){
        res.status(400).send()
    }
})

// Endpoint to get all the tasks of the user logged in 
router.get('/tasks', auth ,async(req, res)=>{
    const match = {}

    if (req.query.completed){
        // Below given line will set match.completed to true (boolean) if req.query.completed is set to true(string)
        match.completed = req.query.completed === 'true'
    }

    try {
        await req.user.populate({
            path : 'tasks',
            match
        }).execPopulate()
        
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
   
})

// Endpoint to get a task by id 
router.get('/tasks/:id', auth , async(req, res)=>{
    const _id = req.params.id
    try {
        // We will only be able to get the task if the task id and user id matches
        const task = await Task.findOne({ _id, owner : req.user._id})

        if (!task){
            return res.status(404).send()
        }
        res.send(task)

    } catch (error) {
        res.status(500).send(error)
    }
    
})


// Endpoint for upating task
router.patch('/tasks/:id', auth, async (req, res)=> {
    const AllowedUpdates = ['description','completed']
    const update = Object.keys(req.body)
    const isValidOperation = update.every((updates) => AllowedUpdates.includes(updates) )

    if(!isValidOperation){
        return res.status(500).send({error : "Invalid Operation"})
    }
    try{

        const task = await Task.findOne({_id : req.params.id , owner : req.user._id})
        
        if(!task){
            return res.status(404).send()
        }
        update.forEach((updates) => {
            task[updates] =  req.body[updates] 
        })
        console.log(task)
        await task.save()
        res.send(task)

    }
    catch(e){
        res.status(400).send(e)
    }
})

// Endpoint for deleting task
router.delete('/tasks/:id', auth ,async(req, res)=>{
    
    const _id = req.params.id
    const task = await Task.findOneAndDelete({ _id , owner : req.user._id})
    try{
    if(!task){
        return res.status(404).send()

    }
    res.send(task)

    }
    catch(e){
        res.send(e)
    }

})

module.exports = router