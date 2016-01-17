"use strict";

var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var request = require('request');
var PORT = process.env.PORT || 3000;
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var SLACK_WEBAPI_TOKEN = process.env.SLACK_WEBAPI_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'dev')));

app.post('/hook', (req, res)=> {
    if (req.body.token == SLACK_TOKEN) {

        request(`https://slack.com/api/users.info?token=${SLACK_WEBAPI_TOKEN}&user=${req.body.user_id}`, (error, userInfoRes, body)=> {
            var jsonBody = JSON.parse(body);
            if (jsonBody.ok == true) {
                io.emit('ding', {name: jsonBody.user.name, image: jsonBody.user.profile.image_48});
            } else {
                io.emit('ding', {error: true});
            }
        });

        res.send(200);
    } else {
        res.send(404);
    }
});

http.listen(PORT, ()=> {
    console.log(`listening on port ${PORT}`);
});
