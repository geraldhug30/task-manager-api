require('../src/db/mongoose'); 
const { User } = require('../src/models/user');
const {Task} = require('../src/models/task')

// const updateAgeAndCount = async (id, age) => {
//     const user = await User.findByIdAndUpdate(id, {age})
//     const count = await User.countDocuments({age})
//     return count
// }

// updateAgeAndCount('5d94028bf8888727ac79f1af', 2).then((count) => {
//     console.log(count)
// }).catch(e => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    const user = await User.findByIdAndDelete(id);
    // const count = await User.countDocuments({completed: false})
    return user
}

deleteTaskAndCount('5d95cbb920ce35242c4c98ac').then( (count) => {
    console.log('Deleted ' + count)
}).catch( err => {
    console.log(err)
})