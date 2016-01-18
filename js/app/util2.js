
define(function(require){
    var obj = {};

    _.extend(obj, {
        refresh: function(o){
            var btn = o.btn, view = o.view;

            btn.click(function(){
                view.render();
            })
        }
    });

    return obj;
});