// TODO: REFACTOR CRAP SINGLE FILE !
const config = require('./config.json');
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const routeValidator = require('express-route-validator');
const bodyParser = require('body-parser')
let api = express.Router();
var multer = require('multer')

let bitly = require('./api/Bitly');
let uploader = require('./api/Uploader');
var URL = require('url-parse');
var User = require('./models/User');


const limits = {
    fieldNameSize: 50,
    fileSize: 5000000
}

var upload = multer({ dest: 'uploads/', limits: limits })

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

api.get('/bitly', authCheck, (req, res, next) => {
    let userId = req.user.sub;
    User.findById(userId).then((user) => {
        res.json(user.get('links'));
    }).catch((err) => {
        return next({ message: 'database error :(' });
    });
});

// Query params : url => bily url.
api.get('/bitly/info', authCheck, (req, res, next) => {
    let bitlyUrl = req.query.url;
    let result = null;

    if (bitlyUrl) {
        bitly.numberOfClick(bitlyUrl).then((numberOfClickResult) => {
            var numberOfClick = numberOfClickResult.data;
            result = numberOfClick;
            if (numberOfClick) {
                bitly.countries(bitlyUrl).then((resCountries) => {
                    result.countries = resCountries.data.countries;
                    res.json(result);
                }).catch((e) => {
                    return next({ message: 'Invalid bilty link' });
                })

            } else {
                return next({ message: 'Invalid bilty link' });
            }
        }).catch((e) => {
            return next({ message: e.message });
        });
    } else {
        return next({ message: 'Invalid url params !!!' });
    }
});


api.post('/bitly/shorten', authCheck, (req, res, next) => {
    let inputUrl = req.body.long_url;
    let userId = req.user.sub;

    // Add protocol to the url  
    let url = new URL(inputUrl, true);
    if (!url.protocol) {
        url.set("protocol", "http:");
    }

    User.findById(userId).then((user) => {
        bitly.shorten(url.toString()).then((result) => {
            user.addLink(result.data);
            user.save().then(() => {
                res.json(result.data);
            }).catch((err) => {
                return next({ message: 'Database insert error :(' });
            });
        }).catch((e) => {
            return next({ message: e.message });
        });
    }).catch((err) => {
        console.error(err);
    });
});

api.post('/upload', upload.single('file', limits), function (req, res, next) {
    // TODO: upload file => bilty file => save db => send response.
    console.log("body : ", req.file);
    res.json(req.file);
});


api.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    res.status(500).json({ status: 500, message: err.message, type: 'internal' });
});

app.listen(3001);
console.log('Listening on http://localhost:3001');