//jshint esversion:8
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');

const saltRounds = 12;
const app = express();
const key = process.env.ENC_KEY;

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(encrypt, {secret: key, encryptedFields: ['password'] });
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
  const objToFind = {email: username};
  await mongoose.connect('mongodb://localhost:27017/securityPractice');
  const findResult = await myColl.findOne(objToFind);
  await mongoose.connection.close();
  if(findResult.email == username) {
    const compareResult = await bcrypt.compare(password, findResult.password);
    if(compareResult) {
      res.render('secrets');
    } else {
      res.render('login');
      console.log('username exist, wrong password');
    }
  } else {
    res.render('login');
    console.log('wrong username');
  }
});

app.route('/register')
.get(async function(req, res) {
  res.render('register');
})
.post(async function(req, res) {
  const email = req.body.username;
  try {
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const objToSend = {email: email, password: hash};
    console.log('objToSend: ', objToSend);
    await mongoose.connect('mongodb://localhost:27017/securityPractice');
    const createResult = await myColl.create(objToSend);
    await mongoose.connection.close();
    console.log(createResult);
    res.render('secrets');
  }
  catch(err) { console.log(err); }
});

app.listen(3000, function() {
  console.log('app start port 3000');
});
