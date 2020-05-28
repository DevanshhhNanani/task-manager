const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

const User = mongoose.model('User',userSchema)

module.exports = User