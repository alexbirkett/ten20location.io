var LocationIo = require('location.io');
var requestApi = require('request');
var request = requestApi.defaults({followRedirect: false, jar: requestApi.jar()});

var locationIo = new LocationIo();


var optimist = require('optimist');
var argv = optimist.usage('Usage: $0  --dbname [string] --port [num]').
    options('e', {
        alias: 'email',
        describe: 'email'
    }).
    options('p', {
        alias: 'password',
        describe: 'password'
    }).
    options('t', {
        alias: 'url',
        describe: 'ten20 api url'
    }).
    options('r', {
        alias: 'port',
        describe: 'location io server port'
    }).

    default('e', 'test@ten20.com').
    default('p', 'test').
    default('t', 'http://localhost:4000').
    default('r', '1337')
    .argv;


locationIo.on('tracker-connected', function(trackerId, protocolName) {
    console.log('new connection ' + trackerId + ' using protocol ' + protocolName);
});

locationIo.on('tracker-disconnected', function(id) {
    console.log('connection closed ' + id);
});


var signIn = function(callback) {
    var credential = {
        email: argv.email,
        password: argv.password
    };
    request.post({url: argv.url + '/signin', json: credential}, function (error, response, body) {

        if (response.statusCode !== 200) {
            error = 'signin failed with ' + response.statusCode;
        }

        callback(error, response, body);
    });
};

var updateMessage = function(trackerId, message, callback) {
    request.post({url: argv.url + '/message/' + trackerId, json: message }, function (error, response, body) {
        callback(error, response, body);
    });
};

var addTracker = function(tracker, callback) {
    request.post({url: argv.url + '/trackers/', json: tracker }, function (error, response, body) {

        if (response.statusCode !== 200) {
            error = 'add tracker failed with ' + response.statusCode;
        }

        callback(error, response, body);
    });
};

var createTracker = function(trackerId) {
    var tracker = {
        name: trackerId,
        serial: trackerId
    };
    return tracker;
}

locationIo.on('message', function(trackerId, message) {
    console.log('message from ' + trackerId);
    updateMessage(trackerId, message, function(error, response, body) {
        if (response.statusCode === 404) {
            addTracker(createTracker(trackerId), function(err) {
                console.log('tracker added ' + err);
                updateMessage(trackerId, message, function(error, response, body) {
                   console.log('update message after add tracker err ' + error);
                   if (response) {
                       console.log('status ' + response.statusCode);
                   }
                });
            });
        }
    })
});


locationIo.createServer(argv.port);

signIn(function(err, response, body) {
    console.log('signin ' + err);


/*    addTracker(createTracker('123456'), function(err) {
        console.log('tracker added ' + err);
    });*/

});