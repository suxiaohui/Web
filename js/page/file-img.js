/**
 * Created by 27385 on 2016/1/14.
 */
define(function(require){
    var util2 = require('app/util2');
    var win = require('ui/window');
    var imgView = require('page/imgView');
    var obj = {}

    _.extend(obj,{
        init:function(o){
            var w = this;

            w.view = new fileImg();

        }
    });

    var fileImg = Backbone.View.extend({
        className:'g-mn-in',
        event:{
            'click img':'preRead'
        },
        initialize:function(){
            var w = this;

        },
        preRead: function(){
            var w = this;

        },
        render: function(){
            var w = this;

            w.template = _.template($('#tpl-file-img').html())

            w.$el.empty().html( w.template({n: _.random(0, 10)}) );
            $('#main').append(w.$el);
            w.win = new win({
                h: 598,
                w: 968,
                contentId: 'img-render',
                hideHd: 1
            });
            w.$el.find('img').click(function(){
                $(this).parents('li').addClass('fg-select');
                w.win.open();
                imgView.init();
                imgView.view.setElement( $('#img-render') );
                imgView.view.render();
            });
        }
    });

    return obj;

});
