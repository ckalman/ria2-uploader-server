// TODO: REFACTOR CRAP SINGLE FILE !
const config = require('./config.json');
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const routeValidator = require('express-route-validator');
const bodyParser = require('body-parser')
let api = express.Router();
var multer  = require('multer')

let bitly = require('./api/Bitly');
let uploader = require('./api/Uploader');
var URL = require('url-parse');


const limits = {
    fieldNameSize: 50,
    fileSize: 5000000
}

var upload = multer({ dest: 'uploads/', limits: limits})




app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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

api.get('/bitly/info/:id/click', authCheck, (req, res) => {

});

api.post('/bitly/shorten', authCheck, (req, res, next) => {
    let inputUrl = req.body.long_url;
    
    // Add protocol to the url  
    let url2 = new URL(inputUrl, true);
    if(!url2.protocol){
        url2.set("protocol", "http:");
    }

    bitly.shorten(url2.toString()).then((result) => {
        res.json(result.data);
    }).catch((e) => {
        return next({message: e.message});
    });
});


// UPLOAD


api.post('/upload/file', upload.single('file', limits), function(req, res, next){
    console.log("body : ", req.file);    
    res.json(req.file);
});


api.param('id', function (req, res, next, id) {
  if(!isNaN(parseFloat(id)) && isFinite(id)){
      next();
    }else{
        return next({status: 500, message: 'id must be integer'});
    }
});

api.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    res.status(500).json({ status: 500, message: err.message, type: 'internal' });
});

app.listen(3001);
console.log('Listening on http://localhost:3001');