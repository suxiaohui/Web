/**
 * Created by 28652 on 2016/1/12.
 */

define(function(require){
    var util2 = require('app/util2');
    var win = require('ui/window');
    var deviceAdd = require('page/deviceAdd');

    var obj = {};

    _.extend(obj, {
        init: function(){
            var w = this;

            w.view = new main();
        }
    });

    var main = Backbone.View.extend({
        className: 'g-mn-in',

        events: {
            'click .j-add': 'add',
            'click .j-play': 'play'
        },

        initialize: function(){
            var w = this;


        },

        add: function(){
            var w = this;

            obj.win.open();
            deviceAdd.init();
            deviceAdd.view.setElement( $('#device-render') );
            deviceAdd.view.render();
        },

        play: function(){
            var w = this;

            console.log(1);
        },

        ajax: function(){
            var w = this;

            //todo ajax获取设备列表

        },

        render: function () {
            var w = this;

            w.template = _.template( $('#tpl-home').html() );
            w.$el.html( w.template({n: _.random(0, 10)}) );

            $('#main').append(w.$el);

            util2.refresh({
                btn: w.$("#refresh"),
                view: obj.view
            });

            obj.win = new win({
                w: 970,
                h: 600,
                contentId: 'device-render',
                hideHd: 1
            });
        }

    });

    return obj;
});
