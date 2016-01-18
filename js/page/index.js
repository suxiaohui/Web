/**
 * Created by 28652 on 2016/1/12.
 */

define(function(require){
    var head = require('layout/head');
    var side = require('layout/side');
    var router = require('app/router');

    var obj = {};

    _.extend(obj, {
        init: function(){
            var w = this;

            w.head = new head();
            w.side = new side();
            w.router = new router({
                defaultHash: '/home',
                jsPath: 'page/'
            });

            w.router.on('CHANGE', function(d){
                var hash = Backbone.history.getHash();

                w.side.highlight(hash);
            })
        }
    });

    return obj;
});