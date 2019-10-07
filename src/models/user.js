const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');


const userSchema = mongoose.Schema({
    name: {
        type:String,
        unique: true,
        required: true
    }, 
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        minLength: 7,
        required: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('pasword cannot containe "password"');
            }
        }
    },  
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// hide password and tokens from users
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

// create virtual field for users and tasks and cannot see on users database
userSchema.virtual('tasks', {
     ref: 'Task',
     localField: '_id',
     foreignField: 'owner'
})

// create token to create user and login user
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({ _id : user._id.toString() }, 'thisismytoken');

    user.tokens = await user.tokens.concat({ token })
    await user.save()

    return token;
}

// check email and password auth in user.js /router
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user){
        return 'Unable to login';
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return 'Unable to login';
    }
    return user;
}

//hash password
userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

// remove task when user deleted profile
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;  