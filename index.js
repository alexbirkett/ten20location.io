var LocationIo = require('location.io');

var locationIo = new LocationIo();

locationIo.on('tracker-connected', function(trackerId, protocolName) {
    console.log('new connection ' + trackerId + ' using protocol ' + protocolName);
});

locationIo.on('tracker-disconnected', function(id) {
    console.log('connection closed ' + id);
});

locationIo.on('message', function(trackerId, message) {
    console.log('message from ' + trackerId);
    console.log(message);
});


locationIo.createServer(1337);