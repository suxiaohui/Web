/**
 * Created by 28652 on 2016/1/15.
 */


define(function(require){
    var util2 = require('app/util2');

    var obj = {};

    _.extend(obj, {
        init: function(){
            var w = this;

            w.view = new main();
        }
    });

    var main = Backbone.View.extend({
        el: '#sideGroup',

        events: {
            //'click .j-sd-nav': 'nav'
        },

        initialize: function(){
            var w = this;

            w.router = new Backbone.Router();
            w.ajax();
        },

        nav: function(e){
            var w = this, dom = $(e.target), id = dom.data('id');

            w.router.navigate('group-detail/' + id, {trigger: true});
        },

        ajax: function(){
            var w = this;

            //todo ajax 获取分组信息
            w.render({list: [{name: '服装店1', id: 0},{name: '服装店2', id: 1},{name: '服装店3', id: 2}]})
        },

        render: function (o) {
            var w = this;

            w.template = _.template( $('#tpl-sd-group').html() );
            w.$el.html( w.template(o) );
        }

    });

    return obj;
});