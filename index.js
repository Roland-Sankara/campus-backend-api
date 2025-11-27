const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Routers
const studentRouter = require('./routes/students.router');
const courseRouter = require('./routes/courses.router');

// Middleware
app.use(express.json())
app.use(cors());
app.use(morgan('common'))

app.use('/api/students', studentRouter);
app.use('/api/courses', courseRouter);

app.get('/api/', (req,res)=>{
    res.send('Welcome to ISBAT-Integrated-Student-Management-System API');
})

const PORT = process.env.PORT || 5008;

app.listen(PORT, ()=>{
    console.log(`Server Listening on Port ${PORT}`);
})
