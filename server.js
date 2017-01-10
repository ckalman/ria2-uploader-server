// server.js
const config = require('./config.json');
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const routeValidator = require('express-route-validator');
let api = express.Router();
let bitly = require('./api/Bitly');


app.use(cors());
app.use('/api/v1', api);



// Authentication middleware provided by express-jwt.
// This middleware will check incoming requests for a valid
// JWT on any routes that it is applied to.
const authCheck = jwt({
    secret: config.AUTH0.SECRET,
    audience: config.AUTH0.CLIENT_ID
});


app.get('/test', (req, res, next) => {
    res.send('Uploader web service running');
});

api.get('/bitly/info/:id', authCheck, routeValidator.validate({

}), (req, res) => {
    console.log(req.params.id);
    res.end();
});

api.get('/bitly/info/:id/click', authCheck, (req, res) =>{

});

api.post('/bitly/shorten', authCheck, (req, res) => {
    bitly.shorten("http://google.ch").then((result) =>{
        res.json(result);
    }).catch((e) =>{
        return next(e);
    });
});

app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'}); 
});

app.listen(3001);
console.log('Listening on http://localhost:3001');