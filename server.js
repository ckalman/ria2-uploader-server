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
var FileValidator = require('./utils/FileValidator');
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

/**
 * Get all user shorten urls.
 */
api.get('/bitly', authCheck, (req, res, next) => {
    let userId = req.user.sub;
    // Get user from the db.
    User.findById(userId).then((u) => {
        res.json(u.get('links'));
    }).catch(e => {
        console.error(e);
        return next({ message: 'read database error.' });
    });
});

/**
 * Give info for a bitly url such as number of click, countries stats.
 * params : url : Bitly url 
 */
api.get('/bitly/info', authCheck, (req, res, next) => {
    let bitlyUrl = req.query.url;
    let result = null;

    if (bitlyUrl) {
        // Retrive the number of click.
        bitly.numberOfClick(bitlyUrl).then((numberOfClickResult) => {
            var numberOfClick = numberOfClickResult.data;
            result = numberOfClick;
            if (numberOfClick) {
                // Retrive countries stats 
                bitly.countries(bitlyUrl).then((resCountries) => {
                    // Put countries stats and numberOfClick together.
                    result.countries = resCountries.data.countries;
                    // Send back the result.
                    res.json(result);
                }).catch((e) => {
                    console.error(e);
                    return next({ message: 'Invalid bilty link' });
                });
            } else {
                return next({ message: 'Invalid bilty link' });
            }
        }).catch((e) => {
            console.error(e);
            return next({ message: e.message });
        });
    } else {
        return next({ message: 'Invalid url params !!!' });
    }
});

/**
 * Shorten the url and give back the new bitly url.
 * Body params:
 *  - long_url : url to be shorten
 */
api.post('/bitly/shorten', authCheck, (req, res, next) => {
    let inputUrl = req.body.long_url;
    let userId = req.user.sub;

    // Add protocol to the url  
    let url = new URL(inputUrl, true);
    if (!url.protocol) {
        url.set("protocol", "http:");
    }

    // Shorten the url 
    bitly.shorten(url.toString()).then((result) => {
        // Add to the db.
        User.findById(userId).then((user) => {
            user.addLink(result.data);
            user.save().then(() => {

            }).catch((e) => {
                console.error(e);
                return next({ message: 'Database insert error :(' });
            });
        }).catch((e) => {
            console.error(e);
            return next({ message: 'database error' });
        });
        // send back the result
        res.json(result.data);
    }).catch((e) => {
        console.error(e);
        return next({ message: e.message });
    });
});

/**
 * Get all user uploads link. 
 */
api.get('/files', authCheck, function (req, res, next) {
    let userId = req.user.sub;
    // Get all user upload link from the db.
    User.findById(userId).then((u) => {
        res.json(u.get('uploads'));
    }).catch(e => {
        console.error(e);
        return next({ message: 'read database error.' });
    });
});

/**
 * Upload and shortcut automaticaly the result. 
 * Give back bitly link.
 * Body params :
 *  - file: File binary
 * TODO: refactor
 */
api.post('/files', authCheck, upload.single('file', limits), function (req, res, next) {
    // File name
    let originalName = req.file.originalname;
    // Unique user id
    let userId = req.user.sub;
    // Path file name
    let tempFileName = req.file.filename;
    let filePath = `${__dirname}/uploads/${tempFileName}`;

    // Check the type of the file.
    FileValidator.check(filePath).then((ok) => {

        // Upload the file
        uploader.upload(filePath, originalName).then((fileId) => {

            // Retrive info data of the uploaded file
            uploader.info(fileId, originalName).then((fileInfo) => {

                if (!fileInfo.original_file_url) {
                    console.error("Upload faild because the api doesn't send back info for the file id : " + fileId);
                    return next({ message: 'Upload failed please wait 5 sec and then retry. (API BUG) If the problem persist please contact the developer.' });
                }

                // Short the file url.
                bitly.shorten(fileInfo.original_file_url).then((result) => {
                    result.data.info = fileInfo;

                    // Add to the database
                    User.findById(userId).then((user) => {
                        user.addUpload(result.data);
                        user.save();
                    }).catch((e) => {
                        console.error(e);
                    });

                    // Send result.
                    res.json(result.data);
                }).catch((e) => {
                    console.error(e);
                    return next({ message: e.message });
                });
            }).catch((e) => {
                console.error(e);
                return next({ message: e.message });
            });
        }).catch((e) => {
            console.error(e);
            return next({ message: e.message });
        });

    }).catch((e) => {
        console.error("error: ", e);
        return next({ message: e.message });
    });
});

/**
 * Remove the uploaded file
 * {uuid} Uuid of the uploaded file (PK).
 */
api.delete('/files/:uuid', authCheck, function (req, res, next) {
    let uuid = req.params.uuid
    let userId = req.user.sub;
    User.findById(userId).then(function (user) {
        let uploads = user.findUpload(uuid);
        if (uploads) {
            // Remove from the database :
            let data = user.removeUpload(uploads);
            uploader.remove(uuid).then((result) => {
                user.save();
                res.json(data);
            }).catch((e) => {
                console.error("Remove file error : ", e);
                return next({ message: e.message });
            });
        } else {
            return next({ message: 'Upload id not found !' });
        }
    }).catch((e) => {
        console.error(e);
        return next({ message: 'Database error user not found' });
    });
});



api.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    res.status(500).json({ status: 500, message: err.message, type: 'internal' });
});



app.listen(3001);
console.log('Listening on http://localhost:3001');