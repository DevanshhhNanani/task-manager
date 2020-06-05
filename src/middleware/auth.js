const jwt = require('jsonwebtoken')
const User = require('../models/user')


const auth = async (req, res, next ) => {
    try{
        // Space after bearer is critical as we need to remove the space after Bearer in our value for key, so it will be decoded properly
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token , process.env.JWT_SECRET)
        const user = await User.findOne({ _id : decode._id, 'token.token' : token })
        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    }catch(e){
        console.log(e)
        res.status(401).send('Error, please authenticate ')
    }
}

module.exports = auth