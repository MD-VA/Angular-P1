const express = require('express');
const mongoose = require('mongoose');
const postsRoutes = require('./routes/posts');
const userRoutes  = require('./routes/user');
const path = require('path');



const app = express();//! it's a big chain of middlware
//!connect to mongoDb database
const URL = 'mongodb+srv://mouad:79989437Mdrvx@cluster0.pautt.mongodb.net/node-angular?retryWrites=true&w=majority'
mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=> {
    console.log('connected to database')})
    .catch(err=> {
        console.log(err);
    });

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/images", express.static(path.join("backend/images")));


app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT, OPTIONS")
    next();
})

app.use( "/api/posts",postsRoutes);
app.use("/api/user" ,userRoutes);



module.exports = app;


