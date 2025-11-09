const express = require('express');
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');

// Initialize express
const app = express();

// Configure body parser
app.use(express.json())

// Simulate a user table local action
const users = Datastore.create('User.db')


app.get('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

app.post('/api/v1/auth/register', async(req,res)=>{
    try {
        const {name,email,password} = req.body;
        
        if(!name || !email || !password){
            return res.status(422).json({message: 'Please fill in all the provided fields'})
        }

        // Validation to prevent email duplication in the database record.
        if(await users.findOne({email})){
            return res.status(409).json({
                message: 'Email already exist'
            })

        }

        const hashed_password = await bcrypt.hash(password,10);

        const newUser = await users.insert({
            name,
            email,
            password: hashed_password
        })

        return res.status(201).json({
            message: "User registered successfully 👍",
            id: newUser._id
        })
        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
})

app.listen(3000, ()=> console.log('Server started at port 3000'))