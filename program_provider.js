/**
 * Created by coockoo on 3/24/14.
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

function ProgramProvider (host, port) {
    this.db = new Db('node-mongo-programs', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function(){});
}
ProgramProvider.prototype.getCollection = function (callback) {
    this.db.collection('programs', {}, function (error, programsCollection) {
        if (error) {
            callback(error);
        } else {
            callback(null, programsCollection);
        }

    });

};
ProgramProvider.prototype.save = function (program, callback) {
    this.getCollection(function (error, programsCollection) {
        programsCollection.insert(program, function () {
            callback(null, program);
        });
    })
};
ProgramProvider.prototype.getAll = function (callback) {
    this.getCollection(function (error, programsCollection) {
        callback(programsCollection.find());
    });
};
ProgramProvider.prototype.get = function (id, callback) {
    this.getCollection(function (error, programsCollection) {
        callback(programsCollection.find({_id: ObjectID("" + id)}));
    });
};
ProgramProvider.prototype.remove = function (id, callback) {
    this.getCollection(function (error, programsCollection) {
        programsCollection.remove({_id: ObjectID("" + id)});
        callback();
    });
};

module.exports = ProgramProvider;
