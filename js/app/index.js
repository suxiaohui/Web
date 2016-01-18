/**
 * 单页面入口文件
 * Created by 28652 on 2015/7/25.
 */

define(function(require){
    /*var head = require('layout/head');
    var sideAll = require('layout/sideAll');
    var account = require('layout/account');
    var router = require('app/router');
    var util = require('app/util');*/

    var obj = {};
    _.extend(obj, {

        init: function(o){
            var w = this;

            console.log('index loaded');
            /*w.sideAll = new sideAll();
            w.router = new router();
            w.account = new account();

            //获取账号信息
            w.account.ajax(function(o){
                util.sessionUser = o.user;
                w.router.start();
            });

            w.router.on('CHANGE', function(){
                w.sideAll.highlight();
            });*/
        }
    });

    return obj;
});