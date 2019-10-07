const mongoose = require('mongoose');
require('dotenv').config();
// database connect
mongoose.connect(process.env.MONGOOSE_URI, 
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => console.log('database connected'))
    .catch((err) => console.log(err))


