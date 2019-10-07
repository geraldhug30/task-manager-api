const express = require('express');

require('./db/mongoose');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

// Router 
const routerUser = require('./router/user')
const routerTask = require('./router/task')

app.use(express.json());

// Maintenance 
// app.use((req, res, next) => {
//     res.status(500).send('we are on maintenance')
//     console.log('smple');
// })

app.use(routerUser);
app.use(routerTask);

app.listen(port, (err) => {
    if(err) console.log(err);
    console.log('app is running on port ' + 3000)
})



// training for database relative
const Task = require('./models/task');
const User = require('./models/user');
const Main = async () => {
    const task = await Task.findById('5d99be796459223be020b1be');
    await task.populate('owner').execPopulate();
    

    const user = await User.findById('5d99b5e98f1dd32c20a6a279');
    await user.populate('tasks').execPopulate();
    console.log(user.tasks)
}
// to execute use Main()