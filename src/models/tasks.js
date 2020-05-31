const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    description : {
        type: String,
        required : true,
        trim : true
    },
    completed : {
        type : Boolean,
        trim : true,
        default : false
    },
    owner : {
        // The data stored in owner will be a mongodb object ID 
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'

    }
},
    {
        timestamps : true
    }) 
    
const Task = mongoose.model('Task', taskSchema)

module.exports = Task