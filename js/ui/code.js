
define(function(require){
    var lc = require('app/lechange');
    var msg = require('ui/message');

    var obj = function(o){
        this.init(o);
    };

    var NUM = 60;

    _.extend(obj.prototype, {
        init: function(o){
            var w = this;

            w.n = NUM;
            w.el = o.el;
            w.phoneInput = o.phoneInput;

            w.initEvent();
        },

        initEvent: function(){
            var w = this;

            w.el.find('a').click(function(){
                w.check();
            })
        },

        check: function(){
            var w = this, val = w.phoneInput.val();

            if(val == ''){
                msg.show('手机号码不能为空！');
                return;
            }

            lc.getValidCodeToPhone({ phoneNumber: val }, function (d){
                msg.show('验证码发送成功！');
                w.buildTimer();
            }, function (data) {
                var errorCode = data.code;
                if ('1110' == errorCode) {
                    msg.show('验证码获取太频繁，请稍候再试~');
                }else{
                    msg.show('获取验证码失败！');
                }
            });

        },

        buildTimer: function(){
            var w = this;

            w.el.find('a').hide();
            w.timeDom = $("<p><i>"+ w.n + "</i>秒后重新获取</p>");

            w.el.append(w.timeDom);

            w.start();
        },

        start: function(){
            var w = this, n = w.n;

            w.timer = setInterval(function(){
                n--;
                w.timeDom.find('i').text(n);
                if(n <= 0){ w.reset(); }
            }, 1000);
        },

        reset: function(){
            var w = this;

            clearInterval(w.timer);
            w.n = NUM;
            w.timeDom.remove();
            w.el.find('a').show();
        }
    });

    return obj;
});