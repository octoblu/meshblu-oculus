'use strict';
var _            = require('lodash');
var util         = require('util');
var nodeOculus   = require('node-oculus');
var EventEmitter = require('events').EventEmitter;
var debug        = require('debug')('meshblu-oculus');

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
  var self = this;
  var oculus = self.getOculus();
  var payload = oculus.getDeviceInfo();
  self.emit('message', {devices: ['*'], topic: 'echo', payload: payload});
};

Plugin.prototype.getOculus = function(){
  var self = this;
  if(!self.oculus){
    self.oculus = nodeOculus.createOculus();
  }
  return self.oculus;
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options || {});
  var oculus = self.getOculus();

  if(oculus.discoverSensor()) {
    setInterval(function(){
      var quat = new Float32Array(4);
      self.emit('message',{ devices: ['*'], payload: oculus.getOrientationQuat(quat)});
    }, self.options.interval);
  }
};

Plugin.prototype.setOptions = function(options){
  this.options = _.defaults(options, {interval: 200});
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
