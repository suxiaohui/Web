/**
JS辅助函数封装
 */
Date.prototype.Format = function(fmt){ //日期格式化函数
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 
// for debug
this.native = this.native || {
	localConfig : {
		picturePath : 'C:\\Users\\Administrator\\lechange\\Pictures',
		recordPath : 'C:\\Users\\Administrator\\lechange\\Records',
		alarmMessageShow : '1',
		alarmSoundIndex : '1',
		runWhenStartup : '1'
	},

	query : function (name, params) {
		if (name === 'GetLocal') {
			return JSON.stringify(this.localConfig);
		} else if (name === 'SetLocal') {}
	}
};

(function (root, factory) {
	root.util = root.util || factory(root);
})(this, function (root) {
	var ExportClass = function () {}; // 返回值

	// 是否存在
	function exist_(o) {
		return !(typeof o === 'undefined' || o === null);
	}

	ExportClass.prototype.exist = exist_;

	// 是否是数组
	function isArray_(o) {
		if (o instanceof Array ||
			(o && o.constructor === Array) ||
			(typeof o === 'object' &&
				Object.prototype.toString.call(o) === '[object Array]')) {
			return true;
		}

		return false;
	}

	ExportClass.prototype.isArray = isArray_;

	// 是否为空
	function isEmpty_(o) {
		if (!o && o !== 0) {
			// 空字符串
			return true;
		} else if (isArray_(o) && o.length === 0) {
			// 空数组
			return true;
		} else {
			for (var key in o) {
				if (o.hasOwnProperty(key)) {
					return false;
				}
			}

			// 空对象（prototype有属性不算）
			return true;
		}
	}

	ExportClass.prototype.isEmpty = isEmpty_;

	// 是否为函数
	function isFunction_(o) {
		try {
			if (!o) {
				return false;
			}

			var str = Object.prototype.toString.call(o);

			return (str === '[object Function]');
		} catch (err) {
			return false;
		}
	}

	ExportClass.prototype.isFunction = isFunction_;

	// 绑定this
	function bind_(that, fn) {
		if (!isFunction_(fn))
			return null;

		return function () {
			return fn.apply(that, arguments);
		}
	}

	ExportClass.prototype.bind = bind_;

	// 函数柯里化
	function curry_(fn) {
		if (!isFunction_(fn))
			return null;

		var args = Array.prototype.slice.call(arguments, 1);

		return function () {
			var innerArgs = Array.prototype.slice.call(arguments);
			var finalArgs = args.concat(innerArgs);

			return fn.apply(null, finalArgs);
		};
	}

	ExportClass.prototype.curry = curry_;

	// 异步调用函数
	function async_(fn, cb, timeout) {
		if (!isFunction_(fn))
			return null;

		return function () {
			if (isFunction_(fn)) {
				var args = arguments;

				setTimeout(function () {
					var ret = fn.apply(null, args);

					if (isFunction_(cb)) {
						cb(ret);
					}
				}, timeout > 0 ? timeout : 0);
			}
		};
	}

	ExportClass.prototype.asyncCall = async_;
	ExportClass.prototype.asynchronize = async_;

	/*
	任务
	功能：执行一个异步函数时，随时可以cancel
	用法：
	var aTask = new Task(function (text) {
		var task = this;

		function timeout () {
			if (!task.canceled) {
				alert(text);
			} else {
				console.log('task canceled');
			}
		}

		setTimeout(timeout, 1000);
	});

	aTask.start('some text'); // 开始执行
	aTask.cancel(); // 中途退出

	注意：一个task只能start一次
	 */
	function Task_(fn) {
		this.fn = typeof fn === 'function' ? fn : null;
	}

	Task_.prototype.start = function () {
		var fn = this.fn;

		if (fn) {
			var args = Array.prototype.slice.call(arguments, 0);

			this.canceled = false;

			return fn.apply(this, args);
		}
	}

	Task_.prototype.cancel = function () {
		this.canceled = true;
	}

	ExportClass.prototype.task = function (fn) {
		return new Task_(fn);
	}

	// 当前时间
	function Now_() {
		return new Date();
	}

	Now_.time = function () {
		return (new Date()).getTime();
	}

	ExportClass.prototype.now = Now_;

	// 时间戳
	function Timestamp_() {
		this.currentTimastamp = function () {
			return Math.round(new Date().getTime() / 1000);
		}

		this.dateFromTimestamp = function (st) {
			var date = new Date(st * 1000).Format("yyyy-MM-dd hh:mm:ss");
			return date;
		}

		this.timestampFromDate = function (dt) {
			try {
				if (typeof dt === 'string') {
					dt = dt.replace(/-/g, '/');
					dt = new Date(dt);
				}

				return Math.round(dt.getTime() / 1000);
			} catch (e) {
				return;
			}
		}
	}

	ExportClass.prototype.timestamp = new Timestamp_();

	// 传递消息（需要C++层配合）
	function Message_() {
		var cbMap = {};

		// 设置消息回调
		this.setCallback = function (msg, cb) {
			cbMap[msg] = isFunction_(cb) ? cb : null;
		}

		// 消息回调执行函数（C++调用）
		this.onMessage = function (msg, strParams) {
			var f = cbMap[msg];

			if (!isFunction_(f)) {
				return;
			}

			//console.log('onMessage');

			var params;

			try {
				params = JSON.parse(strParams);
			} catch (err) {
				console.log(err);
				params = {};
			}

			var sync = params.sync || false;

			if (!sync) {
				async_(function (m, p) {
					f(m, p);
				})(msg, params);
			} else {
				//console.log('sync');
				f(msg, params);
			}
		}

		// 在同一页面中传递消息
		this.sendMessage = function (msg, params) {
			var strParams;

			try {
				strParams = JSON.stringify(params);
			} catch (err) {
				console.log(err);
				strParams = '';
			}

			this.onMessage(msg, strParams);
		}

		this._broadcastFn = function fn(m, p) {
			try {
				var data = {
					'msg' : m,
					'paramString' : JSON.stringify(p)
				};

				root.native.query('BroadcastMsg', JSON.stringify(data));
			} catch (err) {
				console.log(err);
			}
		}

		// 广播消息
		this.broadcast = function (msg, params) {
			//console.log('broadcast');

			var sync = params.sync || false;

			if (!sync) {
				async_(this._broadcastFn)(msg, params);
			} else {
				//console.log('sync');
				this._broadcastFn(msg, params);
			}
		}

		this._sendToMainFn = function fn(m, p) {
			try {
				var data = {
					'msg' : m,
					'paramString' : JSON.stringify(p)
				};

				root.native.query('SendToMainMsg', JSON.stringify(data));
			} catch (err) {
				console.log(err);
			}
		}

		// 发送消息到main frame
		this.sendToMain = function (msg, params) {
			//console.log('sendToMain');

			var sync = params.sync || false;

			if (!sync) {
				async_(this._sendToMainFn)(msg, params);
			} else {
				//console.log('sync');
				this._sendToMainFn(msg, params);
			}
		}
	}

	ExportClass.prototype.message = new Message_();

	// 持久化数据读写（需要C++层配合）
	function LocalData_() {
		this.read = function (path) {
			try {
				var raw = root.native.query('GetLocal', path);
				var data = JSON.parse(raw).data;

				return data;
			} catch (err) {
				console.log(err);
				return null;
			}
		}

		this.write = function (path, value) {
			try {
				var json = {
					path : path,
					value : value
				};

				var str = JSON.stringify(json);
				var ret = root.native.query('SetLocal', str);
				var o = JSON.parse(ret);

				return (o.result === 'success');
			} catch (err) {
				console.log(err);
				return false;
			}
		}
	}

	ExportClass.prototype.localData = new LocalData_();

	// 运行时数据读写（需要C++层配合）
	function RuntimeData_() {

		this.readString = function (key) {
			return root.native.query('GetRuntimeData', key);
		}

		this.readObject = function (key) {
			try {
				var strValue = root.native.query('GetRuntimeData', key);
				return JSON.parse(strValue);
			} catch (err) {
				console.log(err);
				return {};
			}
		}

		this.read = this.readString;

		this.write = function (key, value) {
			try {
				native.query("SetRuntimeData", JSON.stringify({
						key : key,
						value : (typeof value === 'string') ? value : JSON.stringify(value)
					}));

				return true;
			} catch (err) {
				console.log(err);
				return false;
			}
		}
	}

	ExportClass.prototype.runtimeData = new RuntimeData_();

	// 是否是应用程序环境
	function isApp_() {
		return root.native.query('IsApp');
	}

	ExportClass.prototype.isApp = isApp_;

	// 返回 ExportClass 实例
	return new ExportClass();
});
