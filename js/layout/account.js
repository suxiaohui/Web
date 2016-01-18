/**
 * 登录用户
 * Created by 28652 on 2015/7/27.
 */

define('layout/account', function(require){

    var Obj = Backbone.View.extend({
        el: '#g-user',

        initialize: function() {
            var w = this;

        },

        render: function(o) {
            var w = this;

            w.template = _.template( $('#tpl_session_user').html() );
            w.$el.html( w.template(o) );
        },

        ajax: function(fn){
            var w = this;

            $.ajax({
                type: 'get',
                dataType: 'json',
                url: '/api/session/user',
                success: function(o){
                    w.render(o);
                    fn(o);
                }
            });
        }
    });

    return Obj;
});