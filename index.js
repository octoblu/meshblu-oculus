'use strict';
var util = require('util');
var nodeOculus = require('node-oculus');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-oculus')
var oculus;

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    returnDeviceInfo: {
      type: 'boolean',
      required: true ,
      default: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    interval: {
      type: 'integer',
      required: true,
      default: 200
    }
  }
};

function Plugin(){
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = oculus.getDeviceInfo();
  this.emit('message', {devices: ['*'], topic: 'echo', payload: payload});
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
var self = this;
oculus = nodeOculus.createOculus();

if(oculus.discoverSensor()) {
setInterval(function(){
 
 
  var quat = new Float32Array(4);
   // console.log(oculus.getOrientationQuat(quat));
   
    self.emit('message',{
      devices: ['*'],
      payload: oculus.getOrientationQuat(quat)
    });
 

 
}, device.options.interval);
}
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
