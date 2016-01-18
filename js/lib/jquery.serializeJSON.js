/**
 * 把表单的数据以JSON的格式显示。
 * Created by 28652 on 2015/8/26.
 */
(function($){
    $.fn.serializeJSON = function(){
        var o = {};
        $($(this).serializeArray()).each(function(){
            var tmp = this;
            if(o[tmp.name]){
                if($.isArray(o[tmp.name])){
                    o[tmp.name].push(tmp.value);
                }else{
                    o[tmp.name]=[o[tmp.name],tmp.value];
                }
            }else{
                o[tmp.name] = tmp.value;
            }
        });
        return o;
    }
})($);