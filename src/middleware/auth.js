const jwt = require('jsonwebtoken')
const User = require('../models/user')


const auth = async (req, res, next ) => {
    try{
        // Space after bearer is critical as we need to remove the space after Bearer in our value for key, so it will be decoded properly
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token , 'thisismynewtoken')
        const user = await User.findOne({ _id : decode._id, 'token.token' : token })
        console.log(user)
        if(!user){
            throw new Error()
        }

        req.user = user
        next()

    }catch(e){
        res.status(401).send('Error, please authenticate ')
    }
}

module.exports = auth