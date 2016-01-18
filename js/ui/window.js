/**
 * Created by 28652 on 2016/1/14.
 */

define(function(require){

    var obj = Backbone.View.extend({
        className: "u-win-wp",

        events: {
            'click .j-win-close': 'close'
        },

        initialize: function(o){
            var w = this;

            var config = {
                w: 600, h: 500, offsetTop: -80, title: 'µ¯³ö¶Ô»°¿ò', hideHd: 0
            };

            w.opt = $.extend({}, config, o);


            w.render();
        },

        initEvent: function(){
            var w = this;
        },

        initPosition: function(){
            var w = this;

            w.win.css({
                'margin-top': $(window).scrollTop() - w.opt.h/2 + w.opt.offsetTop,
                'margin-left': -w.opt.w/2
            });
        },

        open: function(){
            var w = this;

            w.$el.show();
            w.initPosition();
            w.trigger('open');
        },

        close: function(){
            var w = this;

            w.$el.hide();
            w.trigger('close');
        },

        render: function(){
            var w = this;

            w.template = _.template( $('#tpl-u-win').html() );
            w.$el.html(w.template( w.opt ));
            $(document.body).append(w.$el);

            w.msk = w.$('.j-win-msk');
            w.win = w.$('.j-win');
            w.winCon = w.$('.j-win-con');

            w.win.css({
                height: w.opt.h,
                width: w.opt.w
            });

            if(w.opt.contentId) {
                w.winCon.html($('#' + w.opt.contentId));
            }
        }
    });

    return obj;
});