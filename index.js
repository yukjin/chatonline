/**
 * Created by luzhen on 14-11-10.
 */
var express = require('express');
var app=express();
var control=require('./control.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ips={};
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
var onlineNum=0;

io.on('connection', function (socket) {
    var clientIp=socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;

    ips[clientIp]=clientIp;//客户端ip
    //socket.handshake.address 服务端ip
    onlineNum++;
    socket.broadcast.emit('join', {'ip':clientIp});//广播新用户加入

    io.emit('online num',onlineNum);//广播当前在线人数

    socket.on('chat message', function (msg) {
        if(control.sendControl(clientIp,{'LIMIT_TIME':60*1000,'MAX_SEND_MINUTE':15})){
            socket.broadcast.emit('chat message', {ip:clientIp,'content':msg});
        }
    });

    socket.on('typing', function (msg) {
        if(control.typingControl(clientIp)){
            socket.broadcast.emit('typing', {'ip':clientIp});
        }
    });
    socket.on('stop typing', function (msg) {
        socket.broadcast.emit('stop typing', {'ip':clientIp});
    });

    socket.on('disconnect',function(){
        delete ips[clientIp];
        onlineNum--;
        socket.broadcast.emit('user left', {'ip':clientIp,'onlineNum':onlineNum});
    });
});

http.listen(process.env.PORT||3000, function () {
    console.log('app is listening at port 3000');
});
