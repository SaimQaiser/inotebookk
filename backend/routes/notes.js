const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Note = require('../Models/Note');
const { validationResult, body } = require('express-validator');

//Route 1:
//Get All Notes
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
});

// Route 2:
// Write all notes
router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid Title').isLength({ min: 5 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
});

// Route 3: Update Note
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try {
        const {title,description,tag} = req.body;
        const newNote = {}
        if (title){newNote.title = title};
        if (description){newNote.description = description};
        if (tag){newNote.tag = tag};

        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        if(note.user.toString()!== req.user.id){
            return res.status(404).send("go play somewhere else")
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new : true})
        res.json({note});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
});

// Route 4: Delete Post
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // const {title,description,tag} = req.body;
        // const newNote = {}
        // if (title){newNote.title = title};
        // if (description){newNote.description = description};
        // if (tag){newNote.tag = tag};

        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        if(note.user.toString()!== req.user.id){
            return res.status(404).send("go play somewhere else")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Sucess": "Note has been deleted",note:note});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
});

module.exports = router;