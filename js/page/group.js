/**
 * Created by 28652 on 2016/1/13.
 */

define(function(require){
    var util2 = require('app/util2');
    var obj = {};

    _.extend(obj, {
        init: function(){
            var w = this;

            w.view = new main();
            w.router = new Backbone.Router();
        }
    });

    var main = Backbone.View.extend({

        events: {
            'click li': 'itemClick'
        },

        initialize: function(){
            var w = this;


        },

        itemClick: function(e){
            var w = this, dom = $(e.target);

            if(dom.get(0).tagName != 'LI'){
                dom = dom.parents('li');
            }
            dom.data('c', !dom.data('c') );
            var id = dom.data('id');

            if(dom.data('c')){
                dom.addClass('sel');
            }else{
                dom.removeClass('sel');
            }

            obj.router.navigate('group-detail/' + id, {trigger: true});
        },

        ajax: function(){
            var w = this;

            //todo ajax 获取分组列表。
        },

        render: function () {
            var w = this;

            w.template = _.template( $('#tpl-group').html() );
            w.$el.html( w.template({n: _.random(0, 10)}) );

            $('#main').append(w.$el);

            util2.refresh({
                btn: w.$("#refresh"),
                view: obj.view
            })
        }

    });

    return obj;
});