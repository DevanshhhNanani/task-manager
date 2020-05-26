const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

// app.use((req, res, next) => {
//     if (req.method == 'GET'){
//         res.send("GET requests are disabled")
//     } 
//     else{
// // Letting express know that we're done with the middleware function by calling next
//     next()
//     }
// })

// Middle ware for when app is under maintainance and we need to reject all requests which we receieve and send a 503 status code

// app.use((req, res, next) => {
//         res.status(503).send('App in under maintainance so we can serve you better, please come back later') 
    
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port , ()=> {
    console.log('Server is up on port ',port)
})

// const jwt = require('jsonwebtoken')

// const myFunction = async () =>{
//     const token = await jwt.sign({_id : '5eca84712c44643b81cd7ea9'}, 'thisismynewtoken', {expiresIn : '5 seconds'})
//     console.log(token)

//     console.log(jwt.verify(token , 'thisismynewtoken'))
// }

// myFunction()