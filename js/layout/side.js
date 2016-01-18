/**
 * Created by 28652 on 2016/1/12.
 */


define(function(require){
    var sideGroup = require('layout/side-group');

    var Obj = Backbone.View.extend({
        el: '#side',

        events: {
            'click .j-side': 'nav'
        },

        initialize: function(){
            var w = this;

            w.router = new Backbone.Router();
            w.render();
        },

        nav: function(e){
            var w = this, dom = $(e.target), hash = dom.data('hash');

            if(hash == undefined || hash == ''){
                var parent = dom.parents('.j-side');
                hash = parent.data('hash');
            }
            w.router.navigate(hash, {trigger: true});
        },

        highlight: function(h){
            var w = this;
            var tmp = {'group-detail': 'group'};
            var hash2 = tmp[h.split('/')[0]] ? tmp[h.split('/')[0]] : h;


            w.$('.j-side').removeClass('g-highlight').each(function(){
                var hash = $(this).data('hash');
                if( hash == h ) $(this).addClass('g-highlight');
            })
        },

        render: function () {
            var w = this;

            w.template = _.template( $('#tpl-sd').html() );
            w.$el.html( w.template() );

            sideGroup.init();
        }
    });

    return Obj;
});