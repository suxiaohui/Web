/**
 * Created by 27385 on 2016/1/11.
 */
define(function(require){
    var msg = require('ui/message');
    var lc = require('app/lechange');
    var lan = require('app/lan');
    var obj={};
    _.extend(obj,{
        tpl:{
            deviceAdd : '#tpl-device-add',
            lanAdd : '#tpl-device-lan',
            lanSearch : '#tpl-device-lan-searching',
            lanResult : '#tpl-device-lan-list',
            seriesAdd : '#tpl-device-series',
            seriesSuccess : '#tpl-device-series-success'
        },

        init:function(o){
            var w = this;


            w.view = new main();
        }
    });
    var main = Backbone.View.extend({

        //el:'#device-render',
        //el: '#deviceRender',
        template: _.template($(obj.tpl.deviceAdd).html()),
        events:{
            'click .j-btn-lanAdd':'lanSearch',
            'click .j-btn-seriesAdd':'seriesSearch'
        },
        initialize:function(){
            var w = this;

            //w.render();
        },

        lanSearch:function(){
            var w = this;
            w.$el.find('.j-btn-seriesAdd').parents('li').removeClass('u-btn-selected').siblings('li').addClass('u-btn-selected');

            obj.lanAdd.render();
        },

        seriesSearch:function(){
            var w = this;
            w.$el.find('.j-btn-lanAdd').parents('li').removeClass('u-btn-selected').siblings('li').addClass('u-btn-selected');

            obj.seriesAdd.render();
        },

        render:function(o){
            var w = this;
            w.$el.html(w.template(o));
            obj.lanAdd = new lanAdd();
            obj.seriesAdd = new seriesAdd();
            obj.lanAdd.render();
        }

    });
    var lanAdd = Backbone.View.extend({
        el:'#dc-add',
        template: _.template($(obj.tpl.lanAdd).html()),
        events:{
            'click .j-lan-sec-st':'startSearch'
        },
        initialize:function(){
            var w = this;
        },
        startSearch:function(){
            var w = this;
            obj.lanSearchView = new lanSearchView();
            obj.lanSearchView.render();
            // Todo 与c++通信
            lan.init();
        },
        render:function(o){
            var w = this;
            w.$el.html(w.template(o))
        }
    });

    var lanSearchView = Backbone.View.extend({
        el:'#lan-list',

        template: _.template($(obj.tpl.lanSearch).html()),

        events:{
            'click .j-lan-stop' : 'stopSearch'
        },

        initialize:function(){
            var w = this;
            // Todo 监听C++的回调函�?
            //w.getLanResult();
        },

        stopSearch:function(){
            var w = this;
            obj.lanAdd = new lanAdd();
            obj.lanAdd.render();
        },

        getLanResult : function(){
            obj.lanResult = new lanResult();
            obj.lanResult.render();
        },

        render:function(o){
            var w = this;
            w.$el.empty().html(w.template(o))
        }

    });

    var lanResult = Backbone.View.extend({
        el:'#lan-list',

        template: _.template($(obj.tpl.lanResult).html()),

        events:{
            'click .' : ''
        },

        initialize:function(){
        },

        render:function(o){
            var w = this;
            w.$el.empty().html(w.template(o))
        }

    });

    var seriesAdd = Backbone.View.extend({
        el:'#dc-add',
        template: _.template($(obj.tpl.seriesAdd).html()),
        events:{
            'click .j-series-find':'seriesFind'
        },
        initialize:function(){
            var w = this;
        },
        seriesFind: function(){
            var w = this;
            w.$el.find('.m-series-st').remove();
            w.getDevice();
        },
        getDevice: function(){
            var w = this;
            var seriesId = w.$el.find('.j-series-find').val().toUpperCase();

            checkDeviceBindOrNot(seriesId,function(seriesId,json){
                if(json.data.isMine == true){
                    msg.show('您已添加过此设备');
                    return;
                }else if((!json.data.isMine)&&(json.data.isBind)){
                    msg.show('此设备已被其他用户添�?');
                    return;
                }else{
                    bindDevice(seriesId, function (data){
                        var errorCode = data.code;
                        if (errorCode == "1000") {
                            obj.seriesSuccess = new seriesSuccess();
                            obj.seriesSuccess.render();
                        }
                    });
                }
            });
        },
        render:function(o){
            var w = this;
            w.$el.empty().html(w.template(o))
        }
    });

    var seriesSuccess = Backbone.View.extend({
        el:'#dc-add',

        template: _.template($(obj.tpl.seriesSuccess).html()),

        events:{
            'click .j-series-add-goOn':'addAgain'
        },

        addAgain: function(){
            var w = this;
            obj.seriesAdd = new seriesAdd();
            obj.seriesAdd.render();
        },

        initialize:function(){},

        render:function(o){
            var w = this;
            w.$el.empty().html(w.template(o))
        }

    });
    return obj;
});