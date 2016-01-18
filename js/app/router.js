/**
 * 路由控制
 * Created by 28652 on 2015/7/25.
 */

define('app/router', function(require){

    var obj = Backbone.Router.extend({

        routes: {
            ':one': 'nav',
            ':one/:two': 'nav'
        },

        initialize: function(o){
            var w = this;

            w.defaultHash = o.defaultHash;
            w.jsPath = o.jsPath;

            w.start();

        },

        start: function(){
            var w = this;

            Backbone.history.start({});

            var hash = Backbone.history.getHash();
            if(hash == ""){
                w.navigate(w.defaultHash, {trigger: true});
            }

        },

        nav: function(n, m){
            var w = this;

            w.loadView({ nav: n, params: m});
        },

        loadView: function(o){
            var w = this;

            setTimeout(function(){
                w.trigger('CHANGE');
            }, 0);

            require([w.jsPath + o.nav], function(d){
                if(w.prev){
                    w.prev.view.remove();
                    w.prev.win && w.prev.win.remove();
                }
                d.init();
                d.view.render(o.params || {});
                w.prev = d;
            });


        }
    });

    return obj;
});