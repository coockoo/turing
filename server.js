var express = require('express');
var path = require('path');
var ProgramProvider = require('./program_provider');

var app = express();
var programProvider = new ProgramProvider('localhost', 27017);

app.set('env', 'development');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, '/public')));
app.configure(function() {
    app.use(express.json());
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname + '/saves/temp')}));
});

//var urlRoot = '/labs/project_control/turing_machine';
var urlRoot = '';

app.get(urlRoot + '/', function (request, responce) {
    responce.render('index', {

    });
});
app.post(urlRoot + '/save', function (request, responce) {
    programProvider.save(request.body, function(error, data){
        responce.send(200, JSON.stringify(data));
    });
});
app.get(urlRoot + '/load-all', function (request, responce) {
    programProvider.getAll(function (collection) {
        collection.toArray(function(error, data) {
            responce.send(200, JSON.stringify(data));
        })
    });
});
app.get(urlRoot + '/load/:id', function (request, responce) {
    var id = request.params['id'];
    programProvider.get(id, function (collection) {
        collection.toArray(function(error, data) {
            responce.send(200, JSON.stringify(data[0]));
        })
    });
});
app.get(urlRoot + '/remove/:id', function (request, responce) {
    var id = request.params['id'];
    programProvider.remove(id, function () {
        console.log('removed');
        responce.send(200, JSON.stringify({success: true}));
    });
});
app.get(urlRoot + '/download/:id', function (request, responce) {
    var id = request.params['id'];
    programProvider.get(id, function (collection) {
        collection.toArray(function(error, data) {
            var fs = require('fs');
            var toWrite = JSON.stringify(data[0]);
            var file = __dirname + "/saves/:id.trn".replace(':id', data[0]._id);
            fs.writeFile(file, toWrite, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    responce.send( 200, path.basename(file));
                }
            });
        })
    });
});
app.get(urlRoot + '/download_trn/:id', function (request, response) {
    var fs = require('fs');

    response.download(__dirname + '/saves/:id'.replace(':id', request.params['id']));

});
app.post(urlRoot + '/upload', function (request, response) {
    var fs = require('fs');
    var filePath = request.files.filename.path;
    fs.readFile(filePath, function (err, data) {
        if (err == null) {
            fs.unlinkSync(filePath);
            response.send(200, data);
        }
    });
});
app.listen(8080);

