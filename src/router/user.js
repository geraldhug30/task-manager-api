const express = require('express');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/user')
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../email/email')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email, user.name);
        res.status(201).send({user, token})
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        
        if(!user){
            return res.send('unable to login');
        }
        res.send({ user, token })
        //res.send(user)

    }catch(err){
        res.status(400).send(err)
    } 
})

router.get('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter( token => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send()
    }catch(err){
        res.status(500).send()
    }
})

router.get('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(err){
        res.status(500).send
    }
})

router.get('/users', auth, async (req, res) => {
    try{
        const user = await User.find(req.user);
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    User.findById(_id, (error, user) => {
        if(error) return res.status(404).send('No user found')
        res.send(user);
    })
});

// patch updating using id number in url and properties in json
router.patch('/users/me', auth, async (req, res) => {
    //converting req.body to object array
    const updates = Object.keys(req.body);
    // [ 'name', 'password' ] - depend on user input
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    //return boolean check update to allowedUpdates using include
    const isValidUpdates = updates.every( update => allowedUpdates.includes(update));
    
    if(!isValidUpdates){
        return res.status(400).send({"error": "error updates"})
    };

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
      
        // from above updates update from existing client updates using forEach loops
        updates.forEach( update => req.user[update] = req.body[update])
        // save updates
        await req.user.save()
        res.send(req.user)
    }catch(err){
        return res.status(400).send(err)
    }
})

router.delete('/users/me', auth, async(req, res) =>{
    try{
        await req.user.remove();
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.status(200).send()
    }catch(err) {
        res.status(500).send(err);
    }
})


// upload file usesing multer
const multer = require('multer');
// multer config file, desitination and validate
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

// endpoint
router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next)=> {
    res.status(400).send({ error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) =>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send()
    }catch(err) {
        res.status(500).send(err);
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
           
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar)
    }catch(err){
        res.status(500).send()
    }
})
module.exports = router;