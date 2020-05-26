require('../src/db/mongoose')
const Task = require('../src/models/tasks')

// Task.findByIdAndDelete('5ec7ba7139d15d2b20372b32').then(()=>{
//     console.log("Deleted")
//     return Task.countDocuments({completed : false})
// }).then((count)=> {
//     console.log("Total number of documetns are: ",count)

// }).catch((e) => {
//  console.log(e)
// }
// )

const deleteTaskAndCount = async (id, completed) =>{
    const task = await Task.findByIdAndDelete(id, {completed})
    const count = await Task.countDocuments()
    return count
}   

deleteTaskAndCount('5ec7b720ce67ac28a24a7de0').then((count)=>{
    console.log(count)
}).catch((e)=>{
    console.log(e)
})