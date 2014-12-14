#!/usr/bin/env node
'use strict';

var argv = process.argv;
var monitor = argv[2] || 'steam.monitor';

var http = require('http'),
    childProcess = require('child_process');

function encode(device) {
    console.log('starting recording of stream for device', device);
    var parec = childProcess.spawn('parec', ['-d', device]);

    console.log('starting flac encoder');
    // var encodedStream = childProcess.spawn('flac', [
    //     '--endian=little', '--sign=signed', '--sample-rate=44100', '--bps=16',
    //     '--channels=2', '--silent', '-'
    // ]);
    var encodedStream = childProcess.spawn('lame', ['-V', '0', '-r', '-', '-']);

    parec.stdout.pipe(encodedStream.stdin);

    return encodedStream;
}

var encodedStream = encode(monitor);

// encodedStream.stdout.on('data', function() {
//     console.log(Date.now(), 'data!');
// });

var port = 2000;
console.log('starting http server on port', port);
var server = http.createServer(function(request, response) {
    console.log('got request');

    response.writeHead(200, {
        // 'Content-Type': 'audio/flac'
        'Content-Type': 'audio/mpeg'
    });

    console.log('piping flac stream');
    encodedStream.stdout.pipe(response);
    console.log('fcn end');
}).listen(port);

server.on('connection', function(socket) {
    console.log('setting no delay true');
    socket.setNoDelay(true);
});
