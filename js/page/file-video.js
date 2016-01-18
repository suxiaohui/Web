/**
 * Created by 27385 on 2016/1/14.
 */
define(function(require){
    var util2 = require('app/util2');
    var obj = {}

    _.extend(obj,{
        init:function(o){
            var w = this;

            w.view = new fileVideo();
        }
    });

    var fileVideo = Backbone.View.extend({
        className:'g-mn-in',
        event:{
            'click img': function(e){$(e.target).parents('li').addClass('fg-select');}
        },
        initialize:function(){
            var w = this;

        },
        render: function(){
            var w = this;

            w.template = _.template($('#tpl-file-video').html())

            w.$el.empty().html( w.template({n: 0}) );
            $('#main').append(w.$el);
            w.$el.find('img').click(function(){
                $(this).parents('li').addClass('fg-select');
            });
        }
    });
    return obj;

});
