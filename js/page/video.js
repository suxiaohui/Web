
define(function(require){
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
        },

        initialize: function(){
            var w = this;


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

            w.template = _.template( $('#tpl-video').html() );
            w.$el.html( w.template() );

            $('#main').append(w.$el);
        }

    });

    var list = Backbone.View.extend({
        el: '#videoList',
        initialize: function(){
            var w = this;


        },

        render: function(){

        }
    });

    return obj;
});