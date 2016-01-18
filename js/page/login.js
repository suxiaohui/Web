/**
 * Created by 28652 on 2016/1/7.
 */

define(function(require){
    var lc = require('app/lechange');
    var code = require('ui/code');
    var msg = require('ui/message');
    var pwd = require('ui/password');

    var obj = {};

    _.extend(obj, {
        init: function(o){
            var w = this;

            w.router = new router();

        }
    });

    var router = Backbone.Router.extend({
        routes: {
            ':one': 'nav'
        },

        initialize: function(){
            var w = this;

            w.start();

        },

        start: function(){
            var w = this;

            Backbone.history.start({});

            var hash = Backbone.history.getHash();
            if(hash == ""){
                w.navigate('/login', {trigger: true});
            }

        },

        nav: function(n){
            var w = this;

            w.loadView({ nav: n });
        },

        loadView: function(o){
            var w = this, d = new view[o.nav];

            setTimeout(function(){
                w.trigger('CHANGE');
            }, 0);

            if(w.prev){
                w.prev.remove();
            }

            d.render(o.params || {});
            w.prev = d;

        }
    });


    var view = {};


    view.login = Backbone.View.extend({
        className: 'lg',

        events: {
            'submit #form': 'submit'
        },

        submit: function(){
            var w = this, isAuto = false, f = 0;
            var username = w.$("#phone").val();
            var password = w.$("#pwd").val();

            lc.isUserExists({
                usernameOrPhoneNumber: username
            }, function (data) {
                if (!data.isExists) {
                    msg.show("此手机号不存在！");
                    f = 1;
                }
            });
            if(f) return;

            lc.username(username);
            lc.password(password);

            lc.login({
                clientName : util.localData.read("meta/userAgent"),
                appId : "-1"
            }, function (data) {
                // 登录成功
                //todo 写入C++内存。
                //util.runtimeData.write('currentUserInfo', data);
                var autoLogin = w.$("#auto").attr('checked');

                var localData = {
                    username : username,
                    password : password,
                    autoLogin : autoLogin
                };
                window.native.query("LoginComplete", JSON.stringify(localData));
                isAuto = false;
            }, function (result) {
                // 登录失败
                var resp = {};

                try {
                    if (result.code) {
                        resp = result;
                    } else {
                        resp = JSON.parse(result.responseText);
                    }
                    if (resp.code === 1107) {
                        msg.show("密码输入错误次数过多，账号锁定5分钟！");
                    } else {
                        lc.isUserExists({
                            usernameOrPhoneNumber : username
                        }, function (data) {
                            if (!data.isExists) {
                                msg.show("此手机号不存在！");
                            } else {
                                msg.show("手机号和密码不匹配！");
                            }
                        }, function () {
                            msg.show("账号或密码输入错误，请核对后重新输入！");
                        })
                    }
                } catch (err) {
                    msg.show("此账号还未注册,请立即注册！");
                }
                w.$("#pwd").val('');
                isAuto = false;
            });
            return false;
        },

        render: function(o){
            var w = this;
            w.tpl = _.template( $('#tpl-login').html() );

            w.$el.html( w.tpl(o) );

            $(document.body).append(w.el);
        }
    });



    view.reg = Backbone.View.extend({
        className: 'lg',

        events: {
            'submit #form': 'submit'
        },

        initialize: function(){
            var w = this;

        },

        submit: function() {
            var w = this;
            var phone = w.$("#phone").val();
            var pwd = w.$("#pwd").val();
            var code = w.$('#codeNum').val();

            lc.verifyValidCode({
                phoneNumber: phone,
                validCode: code
            }, function (data) {
                if (data.valid) {
                    var options = {
                        phoneNumber: phone,
                        validCode: code,
                        password: algor.md5( pwd.val() )
                    };
                    lc.addUser(options, function (data) {
                        msg.show('恭喜你，注册成功！');
                    }, function(d){
                        msg.show('注册失败！');
                    });
                } else {
                    msg.show('验证码错误，请重新获取！');
                }
            });
        },

        render: function(o){
            var w = this;
            w.tpl = _.template( $('#tpl-reg').html() );

            w.$el.html( w.tpl(o) );

            $(document.body).append(w.el);

            w.code = new code({
                el: w.$('#codeWp'),
                phoneInput: $('#phone')
            });

            w.pwd = new pwd({
                el: w.$('#pwdTip'),
                input: $('#pwd')
            })
        }
    });

    view.pwd = Backbone.View.extend({
        className: 'lg',
        events: {
            'submit #form': 'submit'
        },

        submit: function() {
            var w = this;
            var phone = w.$("#phone").val();
            var pwd = w.$("#pwd").val();
            var code = w.$('#codeNum').val();

            lc.verifyValidCode({
                phoneNumber: phone,
                validCode: code
            }, function (data) {
                if (data.valid) {
                    var options = {
                        phoneNumber: phone,
                        validCode: code,
                        password: algor.md5( pwd.val() )
                    };
                    lc.resetPassword(options, function (d) {
                        msg.show('密码修改完成！');
                    }, function(d){
                        msg.show('密码修改失败！');
                    });
                } else {
                    msg.show('验证码错误，请重新获取！');
                }
            });
        },

        render: function(o){
            var w = this;
            w.tpl = _.template( $('#tpl-pwd').html() );

            w.$el.html( w.tpl(o) );

            $(document.body).append(w.el);

            w.code = new code({
                el: w.$('#codeWp'),
                phoneInput: $('#phone')
            });
        }
    });

    return obj;
});