const express = require('express')
const Task = require('../models/tasks')
const router = new express.Router()


router.post('/tasks',(req,res)=>{
    
    const task = new Task(req.body)

    task.save().then(()=>{
        res.status(201).send(task)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

router.get('/tasks',(req, res)=>{
    Task.find({}).then((tasks)=>{
        res.send(tasks)
    }).catch((e)=>{
        res.status(500)
    })
})

router.get('/tasks/:id',(req, res)=>{
    const _id = req.params.id

    Task.findById(_id).then((task)=>{
        if (!task){
            res.status(404).send()
        }
        res.send(task)
    }).catch((e)=> {
        res.status(500).send()
    })
})

router.patch('/tasks/:id', async (req, res)=> {
    const AllowedUpdates = ['description','completed']
    const update = Object.keys(req.body)
    const isValidOperation = update.every((updates) => AllowedUpdates.includes(updates) )

    if(!isValidOperation){
        return res.status(400).send({error : "Invalid Operation"})
    }
    try{
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators: true} )

        const task = await Task.findById(req.params.id)
        update.forEach((updates) => {
            task[updates] =  req.body[updates] 
        })
        
        console.log('before saving')
        await task.save()

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',async(req, res)=>{
    
    const _id = req.params.id
    const task = await Task.findByIdAndDelete(_id)
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