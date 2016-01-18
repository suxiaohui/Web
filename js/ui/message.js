/**
 * Created by 28652 on 2016/1/9.
 */

define(function(require){
    var obj = {};

    _.extend(obj, {
        show: function(m){
            alert(m);
        }
    });

    return obj;
});