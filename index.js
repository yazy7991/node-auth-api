const express = require('express');
const Datastore = require('nedb-promises');

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



        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
})

app.listen(3000, ()=> console.log('Server started at port 3000'))