define(function(require){
    var win = require('ui/window');

    var obj = {};

    _.extend(obj,{
        init:function(o){
            var w = this;

            w.view = new main();
        }
    });

    var main = Backbone.View.extend({
        events:{
            'click .j-btn-edit':'editTitle'
        },

        initialize:function(){
            var w = this;
        },

        editTitle:function(e){
            var w = this;
            w.titleEle = $(e.target).siblings('span');
            w.title = w.titleEle.text();
            w.titleEle.hide();
            $('.j-txt-imgTit').show();
            $('.j-txt-imgTit').val(w.title);
        },

        render:function(o){
            var w = this;
            w.template = _.template($('#tpl-img-view').html());
            w.$el.html(w.template(o));
        }
    });

    return obj;
});