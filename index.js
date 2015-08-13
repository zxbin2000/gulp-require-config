'use strict';
var _            = require('underscore');
var gutil        = require('gulp-util');
var PluginError  = gutil.PluginError;
var through      = require('through2');
var path         = require('path');

var PLUGIN_NAME  = 'gulp-require-config';

function _getManifestData(file, opts) {
    var data = null;
    var ext = path.extname(file.path);
    if (ext === '.json') {
        var json = {};
        try {
            var content = file.contents.toString('utf8');
            if (content) {
                json = JSON.parse(content);
            }
        } catch (x) {
            this.emit('error', new PluginError(PLUGIN_NAME,  x));
            return;
        }
        if (_.isObject(json)) {
            Object.keys(json).forEach(function (key) {
                data += key + ':' + json[key] + ',\n'
            });
        }
        
    }
    return data;
}

function revCollector(opts) {
    opts = _.defaults((opts || {}), defaults);
    
    var manifest = '';
    var mutables = [];
    return through.obj(function (file, enc, cb) {
        if (!file.isNull()) {
            var mData = _getManifestData.call(this, file, opts);
            if (mData) {
                manifest = mData;
            } else {
                mutables.push(file);
            }
        }
        cb();
    }, function (cb) {
        mutables.forEach(function (file){
            if (!file.isNull()) {
                var src = file.contents.toString('utf8');
                src = src.replace("//@gulp-md5", manifest);
                file.contents = new Buffer(src);
            }
            this.push(file);
        }, this);
        
        cb();
    });
}

module.exports = revCollector;
