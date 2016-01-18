
define(function(require){

    var Obj = Backbone.View.extend({
        el: '#head',

        events: {

        },

        initialize: function(){
            var w = this;

            w.render();
        },

        render: function () {
            var w = this;

            w.template = _.template( $('#tpl-hd').html() );
            w.$el.html( w.template() );
        }
    });

    return Obj;
});

