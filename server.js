'use strict';

var express      = require('express');
var app          = express();
var server       = require('http').createServer(app);
var io           = require('socket.io').listen(server);
var NoteProvider = require('./db').NoteProvider;

server.listen(process.env.port || 8080, function () {
  console.log('------ socket.io server listening at %s', server.address().port);
});

var noteProvider = new NoteProvider(
  process.env.mongo_host       || 'localhost',
  process.env.mongo_port       || 27017,
  process.env.mongo_db         || 'nki',
  process.env.mongo_collection || 'notes'
);

io.sockets.on('connection', function(socket) {
  var callback = function(err, result) {
    console.log("------ ", err,result);
    err ? socket.emit('err', JSON.stringify(err)) : socket.emit('result', JSON.stringify(result));
  }
  socket.on('find all notes' , function()           { noteProvider.findAllNotes(            callback) });
  socket.on('find note by id', function(parameters) { noteProvider.findNoteById(parameters, callback) });
  socket.on('save note'      , function(parameters) { noteProvider.saveNote    (parameters, callback) });
  socket.on('delete note'    , function(parameters) { noteProvider.deleteNote  (parameters, callback) });
});

process.on('uncaughtException', function (err) {
  console.log( "------ UNCAUGHT EXCEPTION " );
  console.log( "------ [Inside 'uncaughtException' event] " + err.stack || err.message );
});
