//jshint esversion:8
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();
const key = process.env.ENC_KEY;

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(encrypt, {secret: key, encryptedField: ['email', 'password'] });
const myColl = new mongoose.model('user', userSchema);

app.get('/', async function(req, res) {
  res.render('home');
});

app.route('/login')
.get(async function(req, res) {
  res.render('login');
})
.post(async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  await mongoose.connect('mongodb://localhost:27017/securityPractice');
  const findResult = await myColl.find({email: username});
  await mongoose.connection.close();
  console.log(findResult);
  if(findResult.length > 0) {
    console.log(findResult[0].password);
    if(password == findResult[0].password) {
      res.render('secrets');
    } else {
      res.render('login');
    }
  } else {
    res.render('login');
  }
});

app.route('/register')
.get(async function(req, res) {
  res.render('register');
})
.post(async function(req, res) {
  const email = req.body.username;
  const password = req.body.password;
  await mongoose.connect('mongodb://localhost:27017/securityPractice');
  const createResult = await myColl.create({
    email: email,
    password: password
  });
  await mongoose.connection.close();
  console.log(createResult);
  res.render('secrets');
});

app.listen(3000, function() {
  console.log('app start port 3000');
});
