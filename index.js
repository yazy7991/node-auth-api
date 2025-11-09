const express = require('express');

// Initialize express

const app = express();

app.use(express.json())

app.get('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

app.listen(3000, ()=> console.log('Server started at port 3000'))