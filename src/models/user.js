const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require("./tasks")

const userSchema = mongoose.Schema({
    name : {
        type :String,
        trim : true,
        default : 'user',
        required : true
    },
    age : {
        type : Number,
        default : 18,
        validate (value){
            if (value < 0){
                throw new Error("Age must be a postive number")

            }
            if (value <= 17){
                throw new Error('Age must be greater than 18')
            }
        }
    },
    email : {
        type : String,
        unique : true,
        required: true,
        trim : true,
        lowercase : true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        validate (value){
            if (value.length < 6){
                throw new Error ("Password length should be greater than 6 ")
            }
            if (value.toLowerCase().includes("password")){
                throw new Error ('Cannot keep password as password')
            }
        }
    },
    token : [{
        token : {
            type : String,
            required : true
        }
    }]
})

// it's virtual because we are not changing what we store in the document instead it's a way for mongoose to establish a relationship 
userSchema.virtual('tasks', {
    ref : 'Task',
    // Local field is where the local data is stored and connect with foreign field  
    localField : '_id',
    // Foreign field is name of the field on the Task model that's going to create the relationship  
    foreignField : 'owner'
})


// This method will be called whenever a object has to be converted to a JSON object 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    // Deleting the object attributes which we send to the user in response

    delete userObject.password
    delete userObject.token

    return userObject
}

userSchema.methods.generateAuthToken = async function () { 
    const user = this
    const  token = jwt.sign({ _id : user._id.toString() }, 'thisismynewtoken')
    
    user.token = user.token.concat( { token})
    await user.save()

    return token
}


userSchema.statics.findbyCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch){
        throw new Error ("Unable to login")
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    
    next()
})

userSchema.pre('remove',async function (next){
    const user = this
    await task.deleteMany({owner : user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User