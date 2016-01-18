/**
 * Created by 28652 on 2016/1/14.
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
            'click .j-add': 'add'
        },

        initialize: function(){
            var w = this;

        },

        add: function(){
            var w = this;

            obj.win.open();

            deviceAdd.init();
            deviceAdd.view.setElement( $('#deviceRender') );
            deviceAdd.view.render();
        },

        render: function () {
            var w = this;

            w.template = _.template( $('#tpl-group-detail').html() );
            w.$el.html( w.template({n: _.random(0, 10)}) );

            $('#main').append(w.$el);

            util2.refresh({
                btn: w.$("#refresh"),
                view: obj.view
            });

            obj.win = new win({
                w: 970,
                h: 600,
                contentId: 'deviceRender',
                hideHd: 1
            });

        }

    });

    return obj;
});