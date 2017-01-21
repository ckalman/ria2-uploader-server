var Schemas = require("./Schemas.js");
var db = require('node-localdb');
var user = db(__dirname + '/../database/user.json');
var _ = require("lodash");

var User = function (data) {
    this.data = this.sanitize(data);
}

User.prototype.sanitize = function (data) {
    data = data || {};
    schema = Schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema));
}

User.prototype.data = {}

User.prototype.get = function (name) {
    return this.data[name];
}

User.prototype.set = function (name, value) {
    this.data[name] = value;
}

User.prototype.addLink = function (link) {
    console.log("push link : ", link);
    this.data['links'].push(link);
    this.data['links'] = _.uniqBy(this.data['links'], 'hash');
}

User.prototype.addUpload = function (upload) {
    this.data['uploads'].push(upload);
}

/**
 * uuid = upload id
 */
User.prototype.findUpload = function (uuid) {
    return _.find(this.data['uploads'], { info: { uuid: uuid } });
}

User.prototype.removeUpload = function (links) {
    this.data['uploads'] = _.remove(this.data['uploads'], (n) => {
        return n != links
    });
    return this.data['uploads'];
}


User.findById = function (id) {
    return new Promise(function (resolve, reject) {
        user.findOne({ userPK: id }).then(function (u) {
            var userObj = new User(u);
            userObj.set('userPK', id);
            resolve(userObj);
        });
    });
}

User.prototype.save = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        this.data = self.sanitize(this.data);
        user.remove({ id: this.data['id'] }).then(function (u) {
            user.insert(self.data).then(function (u) {
                resolve(true);
            });
        });
    });
}

module.exports = User;