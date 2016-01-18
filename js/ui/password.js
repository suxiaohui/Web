/**
 * Created by 28652 on 2016/1/9.
 */

define(function(require){
    var obj = function(o){
        this.init(o);
    };

    _.extend(obj.prototype, {
        init: function(o){
            var w = this;

            w.el = o.el;
            w.input = o.input;
            w.cls = 'pwd-pro-h';

            w.initEvent();
        },

        initEvent: function(){
            var w = this;

            w.input.keyup(function(){
                w.keyup();
            })
        },

        keyup: function(){
            var w = this;

            w.check();
        },

        check: function(){
            var w = this, val = w.input.val(), n = 1;


            w.render(n);
        },

        render: function(n){
            var w = this;

            w.el.find('i').removeClass(w.cls);
            w.el.find('i').each(function(i, en){
                if(i < n) $(en).addClass(w.cls);
            })
        }
    });

    return obj;
});