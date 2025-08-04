const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const { validationResult, body } = require('express-validator');
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');


const JWT_SECRET = 'Saimisagood$boy';

// Route 1 Create User:
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ error: "sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        // .then(user => res.json(user))
        // .catch(err => {
        //     console.log(err);
        //     res.status(500).json({ error: "Please enter a unique value for email", message: err.message });
        // }); 
        const data = {
            user: {
                id: user.id
            }
        }
        const jwtData = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({ success, jwtData })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }

});
// Route 2 Authenticate user
router.post('/loginuser', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({error:"Enter valid credentials"});
        }

        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error:"Enter valid credentials"});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const jwtData = jwt.sign(data, JWT_SECRET);
        success= true;
        res.json({ success,jwtData })
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

//Route 3 Logging In
router.post('/getuser', fetchUser, async (req, res) => {
try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
        res.status(500).send("some error occured");
}
})
module.exports = router;
