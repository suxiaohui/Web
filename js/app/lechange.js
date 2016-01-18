/**
 * 乐橙平台REST API 封装，接口名称和参数解释参见REST API文档
 */
(function (root, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
			root.lc = factory();
})(this, function () {
	var root = window;
	function ExportClass() {
		var host_ = 'http://42.121.252.141';
		//var host_ = 'http://127.0.0.1:8080';
		//var host_ = 'http://functiontest.lechange.cn';
		var username_ = '18969121721';
		var password_ = 'fcea920f7412b5da7be0cf42b8c93759';
		var mac_ = '11:22:33:44';
		var projectVersion_ = '1.0';
		var projectName_ = 'LeChange';

		if (util.isApp()) {
			try {
				host_ = util.localData.read('url/api');
				username_ = util.runtimeData.read('username');
				password_ = util.runtimeData.read('password');
				mac_ = window.native.query('GetMacAddress');
				projectVersion_ = util.localData.read('meta/version');
				projectName_ = util.localData.read('meta/name');
			} catch (err) {
				console.log(err);
			}
		}

		function dateFormat(date) {
			return date.getUTCFullYear() + '-'
			 + setDay((date.getUTCMonth() + 1)) + '-' + setDay(date.getUTCDate()) + 'T'
			 + setDay(date.getUTCHours()) + ':' + setDay(date.getUTCMinutes()) + ':'
			 + setDay(date.getUTCSeconds()) + 'Z';
		}

		function setDay(value) {
			return value < 10 ? ('0' + value) : value;
		}
		
		/**
		 * 设置发送请求错误时，对错误信息进行提醒[同jsSDK.js]。
		 * @param errorText 错误提示信息
		 */
		function sdkErrorInfoTip(errorText) {
            var PageName = window.PageName;
            var mediaVideo = window.mediaVideo;
            if (mediaVideo && mediaVideo.curPlayType === "video" && ddsocx.helper.isShow) {
                window.theUIApp.tip($(".preview-buttons"),errorText,null,null,null,1);
            }
            else if (mediaVideo && mediaVideo.curPlayType === 'playback' && ddsocx.helper.isShow) {
                window.theUIApp.tip($(".playback-buttons"),errorText,null,null,null,2);
            }
            else if (PageName === "cloudVideoPage" && ddsocx.helper.isShow) {
                window.theUIApp.tip($(".playback-buttons"),errorText,null,null,null,2);
            }
            else if (PageName === "alarmVideo" && ddsocx.helper.isShow) {
                window.theUIApp.tip($(".alarm-buttons"),errorText,null,null,null,3);
            }
            else {
                window.theUIApp.tip($("body"),errorText);
            }
		}

		// Civil请求函数
		// 某些情况下，服务端返回200，并且apicode==1000，但结果仍然是不正确的，
		// 此时需要用cbCustomCheckResponse进行额外检查
		function requestCivil(method, data, cbSuccess, cbError, cbCustomCheckResponse) {
			var httpMethod = 'POST';
			var path = '/civil/api/' + method;
			var clientType = 'web';
			var content = {
				'method' : method,
				'clientType' : clientType,
				'clientMac' : mac_,
				'clientPushId' : '',
				'project' : projectName_,
				'data' : data
			};
			var contentmd5 = algor.md5(JSON.stringify(content));
			var date = data['x-hs-date'] || dateFormat(util.now());
			var signature = httpMethod + '\n' +
				path + '\n' +
				'x-hs-apiver:' + projectVersion_ + '\n' +
				'x-hs-contentmd5:' + contentmd5 + '\n' +
				'x-hs-date:' + date + '\n' +
				'x-hs-username:' + username_ + '\n';
			signature = algor.b64_hmac_sha1(password_, signature);

			var xhr = $.ajax({
                timeout : 20000,
				dataType : 'json',
				type : httpMethod,
				url : host_ + path,
				data : JSON.stringify(content),
				beforeSend : function (request) {
					request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
					request.setRequestHeader('x-hs-apiver', projectVersion_);
					request.setRequestHeader('x-hs-contentmd5', contentmd5);
					request.setRequestHeader('x-hs-date', date);
					request.setRequestHeader('x-hs-username', username_);
					request.setRequestHeader('x-hs-signature', signature);
                    request.setRequestHeader("Connection", "close");
				},
				complete : function(XMLHttpRequest, status) {
        			if (status == 'timeout') {
                        //theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
                        sdkErrorInfoTip("网络不给力，请检查网络配置!", this.url);
            		}
                },
				success : function (result) {
					var resp = {};
					if (result.responseText && result.responseText.length) {
						try {
							resp = JSON.parse(result.responseText);
						} catch (err) {}
					} else if (typeof result.code === 'number') {
						resp = result;
					}

					if (resp.code === 1000) {
						var br = true;

						// 额外检查
						if (typeof cbCustomCheckResponse === 'function') {
							br = cbCustomCheckResponse(resp);
						}

						var cb = br ? cbSuccess : cbError;

						if (typeof cb === 'function') {
							cb(br ? resp.data : result);
						}
					} else {
						if (typeof cbError === 'function') {
							cbError(result);
						}
					}
				},
				error : function (result) {
                    if (result.status == 401) {
                        //theUIApp.tip($("body"), "已修改过密码或手机号，需要重新登录哦");
						sdkErrorInfoTip("已修改过密码，需要重新登录哦");
                        setTimeout(function() {
                             window.native.query('Logout');
                        }, 4000);
                    }
                    else if (result.status == 0) {
                        //theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
						sdkErrorInfoTip("网络不给力，请检查网络配置!");
                    }
					else if (result.status === 412) {
						//客户端所带的x-hs-date时间与服务器时间相差过大, 重新请求
                        data['x-hs-date'] = xhr.getResponseHeader("x-hs-date");
                        console.log(result.getResponseHeader("x-hs-date"));
						request(method, data, cbSuccess, cbError, cbCustomCheckResponse);
					} 
					else if (result.status === 200) {
						var resp = {};
						try {
							resp = JSON.parse(result.responseText);

							if (resp.code === 1000) {
								if (typeof cbSuccess === 'function') {
									cbSuccess(resp.data);
								}

								return;
							}
						} catch (err) {
							console.log(err);
						}

						if (typeof cbError === 'function') {
							cbError(result);
						}
					} else {
						if (typeof cbError === 'function') {
							cbError(result);
						}
					}
				}				
			});
		}
		
        //同步
        function syncRequestCivil(method, data, cbSuccess, cbError, cbCustomCheckResponse) {
            var httpMethod = 'POST';
            var path = '/civil/api/' + method;
            var clientType = 'web';
            var content = {
                'method' : method,
                'clientType' : clientType,
                'clientMac' : mac_,
                'clientPushId' : '',
                'project' : projectName_,
                'data' : data
            };
            var contentmd5 = algor.md5(JSON.stringify(content));
            var date = data['x-hs-date'] || dateFormat(util.now());
            var signature = httpMethod + '\n' +
                path + '\n' +
                'x-hs-apiver:' + projectVersion_ + '\n' +
                'x-hs-contentmd5:' + contentmd5 + '\n' +
                'x-hs-date:' + date + '\n' +
                'x-hs-username:' + username_ + '\n';
            signature = algor.b64_hmac_sha1(password_, signature);

            $.ajax({
                async : false,
                timeout : 20000,
                dataType : 'json',
                type : httpMethod,
                url : host_ + path,
                data : JSON.stringify(content),
                beforeSend : function (request) {
                    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
                    request.setRequestHeader('x-hs-apiver', projectVersion_);
                    request.setRequestHeader('x-hs-contentmd5', contentmd5);
                    request.setRequestHeader('x-hs-date', date);
                    request.setRequestHeader('x-hs-username', username_);
                    request.setRequestHeader('x-hs-signature', signature);
                    request.setRequestHeader("Connection", "close");
                },
                complete : function(XMLHttpRequest, status) {
                    if (status == 'timeout') {
                        theUIApp.tip($(".login"), "网络不给力，请检查网络配置!");
                    }
                },
                success : function (result) {
                    var resp = {};
                    if (result.responseText && result.responseText.length) {
                        try {
                            resp = JSON.parse(result.responseText);
                        } catch (err) {}
                    } else if (typeof result.code === 'number') {
                        resp = result;
                    }

                    if (resp.code === 1000) {
                        var br = true;

                        // 额外检查
                        if (typeof cbCustomCheckResponse === 'function') {
                            br = cbCustomCheckResponse(resp);
                        }

                        var cb = br ? cbSuccess : cbError;

                        if (typeof cb === 'function') {
                            cb(br ? resp.data : result);
                        }
                    } else {
                        if (typeof cbError === 'function') {
                            cbError(result);
                        }
                    }
                },
                error : function (result) {
                    if (result.status == 401) {
                        theUIApp.tip($("body"), "已修改过密码，需要重新登录哦");
                        setTimeout(function() {
                            window.native.query('Logout');
                        }, 4000);
                    }
                    else if (result.status == 0) {
                        theUIApp.tip($(".login"), "网络不给力，请检查网络配置!");
                    }
                    else if (result.status == 412) {
                        //客户端所带的x-hs-date时间与服务器时间相差过大, 重新请求
                        data['x-hs-date'] = result.getResponseHeader("x-hs-date");
                        request1(method, data, cbSuccess, cbError, cbCustomCheckResponse);
                    } 
					else if (result.status === 200) {
                        var resp = {};
                        try {
                            resp = JSON.parse(result.responseText);

                            if (resp.code === 1000) {
                                if (typeof cbSuccess === 'function') {
                                    cbSuccess(resp.data);
                                }

                                return;
                            }
                        } catch (err) {
                            console.log(err);
                        }

                        if (typeof cbError === 'function') {
                            cbError(result);
                        }
                    } else {
                        if (typeof cbError === 'function') {
                            cbError(result);
                        }
                    }
                }
            });
        }

		function getNonce(length) {
			var result = '';
			var chars = ['0', '1', '2', '3', '4', '5',
				'6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

			for (var i = 0; i < length; i++) {
				var id = Math.floor(Math.random() * 16);

				result += chars[id];
			}

			return result;
		}

		function getWsseAuth() {
			var date = dateFormat(util.now());
			var nonce = getNonce(32);
			var passwordDigest = algor.b64_sha1(nonce + date + getUserInfo().password);
			var wsse = 'UsernameToken Username="' + getUserInfo().userName +
				'", PasswordDigest="' + passwordDigest + '", Nonce="' +
				nonce + '", Created="' + date + '"';

			return wsse;
		}

		// DMS请求函数(使用和Civil同样的地址)
		function requestDMS(httpMethod, path, strData, cbSuccess, cbError) {
			$.ajax({
				data : strData,
                timeout: 20000,
				type : httpMethod,
				url : host_ + path,
				beforeSend : function (request) {
					if (httpMethod === 'GET') {
						request.setRequestHeader('Content-Type', 'application/xml');
					} else {
						request.setRequestHeader('Content-Type', 'text/xml;charset=UTF-8');
					}

					request.setRequestHeader('Authorization', 'WSSE profile="UsernameToken"');
					request.setRequestHeader('X-WSSE', getWsseAuth());
                    request.setRequestHeader("Connection", "close");
				},
				success : function (result) {
					cbSuccess(result);
				},
				error : function (result) {
                    if (result.status == 401) {
                        //theUIApp.tip($("body"), "已修改过密码或手机号，需要重新登录哦");
						sdkErrorInfoTip("已修改过密码，需要重新登录哦");
                        setTimeout(function() {
                             window.native.query('Logout');
                        }, 4000);
                    } else  {
                        cbError(result);
                    }
				}
			});
		}

		// 请求分发函数
		function request(method, data, cbSuccess, cbError, cbCustomCheckResponse) {
			try {
				if (method.indexOf('civil') === 0) {
					// civil请求
					requestCivil(method, data, cbSuccess, cbError, cbCustomCheckResponse);
				} else {
					// dms请求（通过civil转发，但是鉴权方法不同）
					requestDMS.apply(root, arguments);
				}
			} catch (err) {}
		}
		
        //cs 同步
        function request1(method, data, cbSuccess, cbError, cbCustomCheckResponse) {
            //try {

                if (method.indexOf('civil') === 0) {
                    // civil请求
                    syncRequestCivil(method, data, cbSuccess, cbError, cbCustomCheckResponse);
                } else {
                    // dms请求（通过civil转发，但是鉴权方法不同）
                    requestDMS.apply(root, arguments);
                }
            //} catch (err) {}
        }

		// 读写主机地址
		this.host = function (data) {
			if (typeof data === 'string') {
				host_ = data;
			} else {
				return host_;
			}
		}

		// 读写用户名
		this.username = function (data) {
			if (typeof data === 'string') {
				username_ = data;
			} else {
				return username_;
			}
		}

		// 读写密码（md5过的数据）
		this.password = function (data) {
			if (typeof data === 'string') {
				password_ = data;
			} else {
				return password_;
			}
		}

		// 读写唯一标示
		this.mac = function (data) {
			if (typeof data === 'string') {
				mac_ = data;
			} else {
				return mac_;
			}
		}

		// 读写项目版本
		this.projectVersion = function (data) {
			if (typeof data === 'string') {
				projectVersion_ = data;
			} else {
				return projectVersion_;
			}
		}

		// 读写项目名称
		this.projectName = function (data) {
			if (typeof data === 'string') {
				projectName_ = data;
			} else {
				return projectName_;
			}
		}

		// ---------------- 外部接口 ----------------

		this.getDeviceList = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				mode : 'bind'
			};

			if (typeof options.mode === 'string') {
				data.mode = options.mode;
			}

			if (util.isArray(options.filter) && options.filter.length !== 0) {
				data.filter = options.filter;
			} else {
				data.filter = [];
			}

			request('civil.device.GetDeviceList', data, cbSuccess, cbError);
		}

		this.getDeviceShare = function (options, cbSuccess, cbError) {
			request('civil.device.GetDeviceShare', options, cbSuccess, cbError);
		}
		
		this.setDeviceShare = function (options, cbSuccess, cbError) {
			request('civil.device.SetDeviceShare', options, cbSuccess, cbError);
		}

		this.getSystemMessage = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {};

			options = options || {};
			data.count = options.count || 10;
			data.msgId = options.msgId || -1;

			request('civil.message.GetSystemMessage', data, cbSuccess, cbError);
		}

		this.postFeedback = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				content : ''
			};

			if (typeof options.content === 'string') {
				data.content = options.content;
			}

			request('civil.message.PostFeedback', data, cbSuccess, cbError);
		}

		this.getAlarmMessage = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				beginTime:0,
				endTime:0,
				alarmId : -1,
				count : 10,
				deviceId:"",
				channelId:"",
				readFlag : -1
			};

			if (typeof options.count === 'number') {
				data.count = options.count;
			}
			if (typeof options.channelId === 'string') {
				data.channelId = options.channelId;
			}
			if (typeof options.readFlag === 'number') {
				data.readFlag = options.readFlag;
			}
			if (typeof options.alarmId === 'number') {
				data.alarmId = options.alarmId;
			}
			if (typeof options.deviceId === 'string') {
				data.deviceId = options.deviceId;
			}
			if (!isNaN(options.beginTime) && typeof options.beginTime === 'number') {
				data.beginTime = options.beginTime;
			}
			if (!isNaN(options.endTime) && typeof options.endTime === 'number') {
				data.endTime = options.endTime;
			}

			request('civil.message.GetAlarmMessage', data, cbSuccess, cbError);
		}

		this.markAlarmMessage = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				markAction : 1,
				channelId : '',
				markIds : [],
				deviceId : ''
			};

			if (typeof options.markAction === 'number') {
				data.markAction = options.markAction;
			}
			if (typeof options.channelId === 'string') {
				data.channelId = options.channelId;
			}
			if (util.isArray(options.markIds)) {
				data.markIds = options.markIds;
			}
			if (typeof options.deviceId === 'string') {
				data.deviceId = options.deviceId;
			}
			request('civil.message.MarkAlarmMessage', data, cbSuccess, cbError);
		}

		this.deleteAlarmMessage = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				channelId : '',
				deleteIds : [],
				readFlag : -1,
				deviceId : ''
			};

			if (typeof options.channelId === 'string') {
				data.channelId = options.channelId;
			}
			if (util.isArray(options.deleteIds)) {
				data.deleteIds = options.deleteIds;
			}
			if (typeof options.readFlag === 'number') {
				data.readFlag = options.readFlag;
			}
			if (typeof options.deviceId === 'string') {
				data.deviceId = options.deviceId;
			}

			request('civil.message.DeleteAlarmMessage', data, cbSuccess, cbError);
		}

		this.getAppVersionInfo = function (cbSuccess, cbError) {
			request('civil.message.GetAppVersionInfo', {}, cbSuccess, cbError);
		}

		this.login = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				appId : options.appId || '',
				clientName : options.clientName || ''
			};

			request1('civil.user.UserLogin', data, cbSuccess, cbError);
		}

        this.GetLoginInfo = function (cbSuccess, cbError) {
        	var data = {count: 2};
            request('civil.user.GetLoginInfo', data, cbSuccess, cbError);
        }

		this.isUserExists = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				usernameOrPhoneNumber : options.usernameOrPhoneNumber || ''
			};

			request1('civil.user.IsUserExists', data, cbSuccess, cbError);
		}

		this.verifyValidCode = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				phoneNumber : options.phoneNumber || '',
				validCode : options.validCode || ''
			};

			request1('civil.user.VerifyValidCode', data, cbSuccess, cbError);
		}

		this.getValidCodeToPhone = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				phoneNumber : options.phoneNumber || ''
			};

			request1('civil.user.GetValidCodeToPhone', data, cbSuccess, cbError);
		}

		this.addUser = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				username : options.phoneNumber || '',
				phoneNumber : options.phoneNumber || '',
				nickname : options.username || '',
				password : options.password || '',
				validCode : options.validCode || ''
			};

			request1('civil.user.AddUser', data, cbSuccess, cbError);
		}

		this.resetPassword = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				phoneNumber : options.phoneNumber || '',
				newPassword : options.newPassword || '',
				validCode : options.validCode || ''
			};

			request('civil.user.ResetPassword', data, cbSuccess, cbError);
		}

		this.getChildUser = function (cbSuccess, cbError) {
			request('civil.user.GetChildUser', {}, cbSuccess, cbError);
		}

		// 由于返回结果只能为成功或者失败，本接口只支持单个子账户的删除！
		this.deleteChildUser = function (options, cbSuccess, cbError) {
			var data = {
				childUsers : options.childUsers || []
			};

			request('civil.user.DeleteChildUser', data, cbSuccess, cbError, function (resp) {
				try {
					var username = options.childUsers[0];

					for (var i in resp.data.results) {
						if (resp.data.results[i].username === username
							 && resp.data.results[i].resultCode === 0) {
							return true;
						}
					}
				} catch (err) {
					return false;
				}

				return false;
			});
		}

		// 由于返回结果只能为成功或者失败，本接口只支持单个子账户的冻结和授权！
		this.controlChildUser = function (options, cbSuccess, cbError) {
			var data = {
				childUsers : options.childUsers || []
			};

			request('civil.user.ControlChildUser', data, cbSuccess, cbError, function (resp) {
				try {
					var username = options.childUsers[0].username;

					for (var i in resp.data.results) {
						if (resp.data.results[i].username === username
							 && resp.data.results[i].resultCode === 0) {
							return true;
						}
					}
				} catch (err) {
					return false;
				}

				return false;
			});
		}

		this.addChildUser = function (options, cbSuccess, cbError) {
			var data = {
				childUsers : options.childUsers || []
			};

			request('civil.user.AddChildUser', data, cbSuccess, cbError, function (resp) {
				try {
					var username = options.childUsers[0].username;

					for (var i in resp.data.results) {
						if (resp.data.results[i].username === username
							 && resp.data.results[i].resultCode === 0) {
							return true;
						}
					}
				} catch (err) {
					return false;
				}

				return false;
			});
		}

		this.getChildUserDeviceList = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				childUsername : options.childUsername || ''
			};

			request('civil.user.GetChildUserDeviceList', data, cbSuccess, cbError);
		}

		this.modifyChildUser = function (options, cbSuccess, cbError) {
			request('civil.user.ModifyChildUser', options, cbSuccess, cbError);
		}
		
		this.modifyPhoneNumber = function (options, cbSuccess, cbError) {
			options = options || {};

			var data = {
				phoneNumber : options.phoneNumber || '',
				validCodeOld : options.validCodeOld || '',
				validCode : options.validCode || ''
			};
			
			request('civil.user.ModifyPhoneNumber', data, cbSuccess, cbError);
		}
		
		this.getAlarmPlanConfig = function (options, cbSuccess, cbError) {
			options = options || {};
			
			var data = {
				deviceId: options.deviceId || '',
				channelId: options.channelId || ''
			};
			
			request('civil.device.GetAlarmPlanConfig', data, cbSuccess, cbError);
		}
		
		this.setAlarmPlanConfig = function (options, cbSuccess, cbError) {
			options = options || {};
			
			var data = {
				deviceId: options.deviceId || '',
				channels: options.channels || []
			};
			
			request('civil.device.SetAlarmPlanConfig', data, cbSuccess, cbError);
		}
		
		this.queryCloudRecords = function (options, cbSuccess, cbError) {
			options = options || {};
		
			var data = {
				deviceId: options.deviceId,
				channelId: options.channelId,
				beginTime: options.beginTime || 0,
				endTime: options.endTime || 0,
				need: options.need || '0-25'
			};
			
			request('civil.storage.QueryCloudRecords', data, cbSuccess, cbError);
		}
		
		this.queryCloudRecordNum = function (options, cbSuccess, cbError) {
			options = options || {};
		
			var data = {
				deviceId: options.deviceId,
				channelId: options.channelId,
				beginTime: options.beginTime || 0,
				endTime: options.endTime || 0
			};
			request('civil.storage.QueryCloudRecordNum', data, cbSuccess, cbError);
		}
		
		this.getStorageStrategyList = function (options, cbSuccess, cbError) {
			request('civil.storage.GetStorageStrategyList', {}, cbSuccess, cbError);
		}
		
		this.getStorageStrategy = function (options, cbSuccess, cbError) {
			options = options || {};
		
			var data = {
				deviceId: options.deviceId,
				channelId: options.channelId
			};
			
			request('civil.storage.GetStorageStrategy', data, cbSuccess, cbError);
		}
		
		this.getCloudStrategyByCallback = function (reqData, callback, cbError) {
			var data = {
				deviceId: reqData.deviceId,
				channelId: reqData.channelId
			};
			
			var cbSuccess = function(result) {
				if (typeof callback === 'function') {
					callback(reqData, result);
				}
			};
	
			request('civil.storage.GetStorageStrategy', data, cbSuccess, cbError);
		}
		
		this.setStorageStrategy = function (options, cbSuccess, cbError) {
			options = options || {};
		
			var data = {
				deviceId: options.deviceId,
				channelId: options.channelId,
				strategyId: options.strategyId
			};
			
			request('civil.storage.SetStorageStrategy', data, cbSuccess, cbError);
		}

	}

	return new ExportClass();
});
