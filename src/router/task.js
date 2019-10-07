const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

// read task
// pagnation limit=10&skip=10 'page 2'
// sortBy=createdAt_asc or _desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try{
        // const task = await Task.find({ owner: req.user._id });
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({ 
        ...req.body,
        owner: req.user._id
    });
    try{
        task.save()
        res.status(201).send(task)
    }
    catch(err){
        res.status(500).send(err)
    }   
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try{
        //check user info in req.user auth
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        
        if(!task){
            return res.status(401).send()
        }
        res.send(task)
    } catch(err) {
        
        res.status(500).send()
    }
    
})


router.patch('/tasks/:id', auth,  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdates = updates.every( items => allowedUpdates.includes(items))
    if(!isValidUpdates){
        return res.status(400).send({"error": "error updates"})
    }
    try{
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        const task = await Task.findOne({
            _id:req.params.id,
            owner: req.user._id
        });

        if(!task){
            return res.status(500).send("error")
        }

        // from above updates update from existing client updates using forEach loops
        updates.forEach( update => task[update] = req.body[update])
        // save updates
        await task.save()
        
        
        res.status(200).send(task)
    }catch(err){
        return res.status(400).send(err)
    }
})


router.delete('/tasks/:id', auth, async(req, res) =>{
    try{
        const task = await Task.findOneAndDelete({
            _id:req.params.id,
            owner: req.user._id
        });
        if(!task){
            return res.status(401).send()
        }
        res.status(200).send(task)
    }catch(err) {
        res.status(500).send('error' + err);
    }
})



module.exports = router;