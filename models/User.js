var schemas = require("./Schemas.js");
var db = require('node-localdb');
var user = db(__dirname + '/../database/user.json');
var _ = require("lodash");

var User = function (data) {
    this.data = this.sanitize(data);
}

User.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema));
}

User.prototype.data = {}

User.prototype.get = function (name) {
    return this.data[name];
}

User.prototype.set = function (name, value) {
    this.data[name] = value;
}

User.findById = function (id) {
    return new Promise(function (resolve, reject) {
        user.findOne({ id }).then(function (u) {
            console.log("ddssada sda a", u);
            resolve(new User(u));
        });
    });
}

User.prototype.save = function () {
    var self = this;
    return Promise(function (resolve, reject) {
        this.data = this.sanitize(this.data);
        user.remove({ id: this.data['id'] }).then(function (u) {
            user.insert(self.data).then(function (u) { });
        });
    });
}

module.exports = User;