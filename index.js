var LocationIo = require('location.io');
var requestApi = require('request');
var request = requestApi.defaults({followRedirect: false, jar: requestApi.jar()});

var locationIo = new LocationIo();

var optimist = require('optimist');
var argv = optimist.usage('Usage: $0  --url [string] --port [num]').
    options('u', {
        alias: 'url',
        describe: 'ten20 api url'
    }).
    options('p', {
        alias: 'port',
        describe: 'location io server port'
    }).
    default('u', 'http://localhost:4000').
    default('p', '1337')
    .argv;

locationIo.on('tracker-connected', function(trackerId, protocolName) {
    console.log('new connection ' + trackerId + ' using protocol ' + protocolName);
});

locationIo.on('tracker-disconnected', function(id) {
    console.log('connection closed ' + id);
});

var updateMessage = function(trackerId, message, callback) {
    request.post({url: argv.url + '/message/' + trackerId, json: message }, function (error, response, body) {
        callback(error, response, body);
    });
};

locationIo.on('message', function(trackerId, message) {
    console.log('message from ' + trackerId);
    console.log(message);
    updateMessage(trackerId, message, function(error, response, body) {
        console.log('message sent ' + error);
        if (response) {
            console.log('status ' + response.statusCode);
        }
        if (response.statusCode === 404) {
            console.log('unregistered tracker ' + trackerId);
        }
    })
});

locationIo.createServer(argv.port);
