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

User.prototype.addLink = function(link){
    this.data['links'].push(link);
    this.data['links'] = _.uniq(this.data['links'], 'url');
}

User.prototype.addUpload = function(upload){
    this.data['uploads'].push(upload);
    this.data['uploads'] = _.uniq(this.data['uploads'], 'url');
}

User.findById = function (id) {
    return new Promise(function (resolve, reject) {
        user.findOne({ id }).then(function (u) {
            var userObj = new User(u);
            userObj.set('id', id);
            resolve(userObj);
        });
    });
}

User.prototype.save = function () {
    var self = this;
    return new Promise(function(resolve, reject) {
        this.data = self.sanitize(this.data);
        user.remove({ id: this.data['id'] }).then(function (u) {
            user.insert(self.data).then(function (u) { 
                resolve(true);
            });
        });
    });
}

module.exports = User;