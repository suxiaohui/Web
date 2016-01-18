var user = {
	clineMac:parseInt(Math.random()*10000),
	userName:"18969121721",
	password:"fcea920f7412b5da7be0cf42b8c93759",
	projectVersion:"1.0",
	projectName:"LeChange-Pro",
	baseUrl:"http://42.121.252.141"
};

if (util.isApp()) {
	try {
		user.baseUrl = util.localData.read('url/api');
		user.userName = util.runtimeData.read('username');
		user.password = util.runtimeData.read('password');
		user.clineMac = window.native.query('GetMacAddress');
		user.projectVersion = util.localData.read('meta/version');
		user.projectName = util.localData.read('meta/name');
	} catch (err) {
		console.log(err);
	}
}

function getUserInfo(){
	return user;
}

/**
 * 设置发送请求错误时，对错误信息进行提醒[同lechange.js]。
 * @param errorText 错误提示信息
 */
//function sdkErrorInfoTip(errorText) {
//    var mediaVideo = window.mediaVideo;
//    var PageName = window.PageName;
//    if (mediaVideo && mediaVideo.curPlayType === "video" && ddsocx.helper.isShow) {
//        window.theUIApp.tip($(".preview-buttons"),errorText,null,null,null,1);
//    }
//    else if (mediaVideo && mediaVideo.curPlayType === 'playback' && ddsocx.helper.isShow) {
//        window.theUIApp.tip($(".playback-buttons"),errorText,null,null,null,2);
//    }
//	else if (PageName === "cloudVideoPage" && ddsocx.helper.isShow) {
//        window.theUIApp.tip($(".playback-buttons"),errorText,null,null,null,2);
//	}
//	else if (PageName === "alarmVideo" && ddsocx.helper.isShow) {
//        window.theUIApp.tip($(".alarm-buttons"),errorText,null,null,null,3);
//	}
//	else {
//        window.theUIApp.tip($("body"),errorText);
//	}
//}

jQuery.support.cors = true;

/**
 * 远程调用rest接口 
 * @param method - 方法名
 * @param data - post提交数据
 * @param callback - 回调方法
 * @param restType - 是否为DMS方式,默认为null,填写dms则表示调用DMS接口
 * @param port - dms调用url 
 * @param methodType - ajax的method方式:GET|POST
 * @return
 */
function restCivilAPISDK(method, data, callback, errCallback){
	var type = "POST";
	var url =  "/civil/api/" + method;
	var clientType = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent) ? "phone" : "web";
	var	content = {
		"method" : method,
		"clientType" : clientType,
		"clientMac" : getUserInfo().clineMac,
		"clientPushId" : "",
		"project" : getUserInfo().projectName,
		"data" : data
	};
	var contentmd5 = algor.md5(JSON.stringify(content));
	var date = data['x-hs-date'] || dateFormat(new Date());
	var signature = type + "\n" + 
		url + "\n" +
		"x-hs-apiver:" + getUserInfo().projectVersion + "\n" +
		"x-hs-contentmd5:" + contentmd5 + "\n" +
		"x-hs-date:" + date + "\n" +
		"x-hs-username:" + getUserInfo().userName + "\n";
	signature = algor.b64_hmac_sha1(getUserInfo().password, signature);

	$.ajax({
		type: type,
        timeout: 20000,
		dataType: "json",
		data: JSON.stringify(content),
		url: getUserInfo().baseUrl+url,
		beforeSend: function(request) {
			request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
			request.setRequestHeader("x-hs-apiver", getUserInfo().projectVersion);
			request.setRequestHeader("x-hs-contentmd5", contentmd5);
			request.setRequestHeader("x-hs-date", date);
			request.setRequestHeader("x-hs-username", getUserInfo().userName);
			request.setRequestHeader("x-hs-signature", signature);
            request.setRequestHeader("Connection", "close");
		},
		success: function(resultJSON) {
			callback(resultJSON);
		},
		error: function(result) {
			if (result.status == 0) {
				//theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
				//sdkErrorInfoTip("网络不给力，请检查网络配置!");
			}
			
			if (result.status == 401) {
                //theUIApp.tip($("body"), "已修改过密码或手机号，需要重新登录哦");
                //sdkErrorInfoTip("已修改过密码，需要重新登录哦");
                setTimeout(function() {
					window.native.query('Logout');
                }, 4000);
            }

            if (result.status == 412) {
				//客户端所带的x-hs-date时间与服务器时间相差过大, 重新请求
                //console.log(result.getResponseHeader('x-hs-date'));
                data['x-hs-date'] = result.getResponseHeader("x-hs-date");
				//restAPISDK(method, data, callback, restType, port, methodType);
                restCivilAPISDK(method, data, callback, errCallback);
				return;
			}
			//callback(null);
			//errCallback(result);
		}
	});
}

/**
 * 远程调用rest接口(同步方式)
 * @param method
 * @param data
 * @param callback
 */
function restCivilAPISDK1(method, data, callback){
    var type = "POST";
    var url =  "/civil/api/" + method;
    var clientType = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent) ? "phone" : "web";
    var	content = {
        "method" : method,
        "clientType" : clientType,
        "clientMac" : getUserInfo().clineMac,
        "clientPushId" : "",
        "project" : getUserInfo().projectName,
        "data" : data
    };
    var contentmd5 = algor.md5(JSON.stringify(content));
    var date = data['x-hs-date'] || dateFormat(new Date());
    var signature = type + "\n" +
        url + "\n" +
        "x-hs-apiver:" + getUserInfo().projectVersion + "\n" +
        "x-hs-contentmd5:" + contentmd5 + "\n" +
        "x-hs-date:" + date + "\n" +
        "x-hs-username:" + getUserInfo().userName + "\n";
    signature = algor.b64_hmac_sha1(getUserInfo().password, signature);

    $.ajax({
        type: type,
        async: false,
        timeout: 20000,
        dataType: "json",
        data: JSON.stringify(content),
        url: getUserInfo().baseUrl+url,
        beforeSend: function(request) {
            request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            request.setRequestHeader("x-hs-apiver", getUserInfo().projectVersion);
            request.setRequestHeader("x-hs-contentmd5", contentmd5);
            request.setRequestHeader("x-hs-date", date);
            request.setRequestHeader("x-hs-username", getUserInfo().userName);
            request.setRequestHeader("x-hs-signature", signature);
            request.setRequestHeader("Connection", "close");
        },
        success: function(resultJSON) {
            callback(resultJSON);
        },
        error: function(result) {
			if (result.status == 0) {
				theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
			}
            if (result.status == 401) {
                //theUIApp.tip($("body"), "已修改过密码，需要重新登录哦");
                setTimeout(function() {
                    window.native.query('Logout');
                }, 4000);
            }

            if (result.status == 412) {
                //客户端所带的x-hs-date时间与服务器时间相差过大, 重新请求
                data['x-hs-date'] = result.getResponseHeader("x-hs-date");
                //restAPISDK(method, data, callback, restType, port, methodType);
                restCivilAPISDK1(method, data, callback);
            }
            //callback(null);
        }
    });
}

function setDay(value) {
	return value < 10 ? "0" + value : value;
}

function dateFormat(date) {
	return date.getUTCFullYear() + "-" + setDay((date.getUTCMonth() + 1)) + "-" + setDay(date.getUTCDate()) + "T" 
	+ setDay(date.getUTCHours()) + ":" + setDay(date.getUTCMinutes()) + ":" + setDay(date.getUTCSeconds())+"Z";
}

function getNonce(length) {
	var result = "";
	var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
	for(var i=0;i<length;i++){
		var id = Math.floor(Math.random()*16);
		result += chars[id];
	}
	return result;
}

function getWsseAuth(){
	var date = dateFormat(new Date());
	var nonce = getNonce(32);
	var passwordDigest = algor.b64_sha1(nonce+date+getUserInfo().password);
	var wsse = "UsernameToken Username=\""+getUserInfo().userName+"\", PasswordDigest=\""+passwordDigest+"\", Nonce=\""+nonce+"\", Created=\""+date+"\"";
	return wsse;
}

function restDmsAPISDK(method, data, callback, port, methodType, cbError){
	var type = (methodType === "POST" ? "POST" : "GET");
	var url = (port.indexOf("http://") !== 0 ? "http://" : "") + port + method;	

	$.ajax({
		type: type,
	    url : url,
		data: data,
        timeout: 20000,
		beforeSend: function(request) {
			if (type == "GET") {
				request.setRequestHeader("Content-Type","application/xml");
			} else {
				request.setRequestHeader("Content-Type","text/xml;charset=UTF-8");
			}
			
			request.setRequestHeader("Authorization","WSSE profile=\"UsernameToken\"");
			request.setRequestHeader("X-WSSE",getWsseAuth());
            request.setRequestHeader("Connection","close");
		},
        complete: function(XMLHttpRequest, status) {
			//TODO获取升级进度暂不处理超时，后期需要优化
			if (this.url.indexOf("/upgrade-progress") > 0) {
				return;
			}
			
			if (status == 'timeout') {
				//theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
				sdkErrorInfoTip("网络不给力，请检查网络配置!");
			}
		},
		success: function(resultJSON) {
			callback(resultJSON);
		},
		error: function(result) {
			if (result.status == 0) {
				//theUIApp.tip($("body"), "网络不给力，请检查网络配置!");
				sdkErrorInfoTip("网络不给力，请检查网络配置!");
			} else if (result.status == 401) {
                //theUIApp.tip($("body"), "已修改过密码或手机号，需要重新登录哦");
				/*sdkErrorInfoTip("已修改过密码或手机号，需要重新登录哦");
                setTimeout(function() {
					window.native.query('Logout');
                }, 4000);*/
            } else if (result.status == 412) {
				//客户端所带的x-hs-date时间与服务器时间相差过大, 重新请求
                //console.log('restAPISDK', restAPISDK);
				//restAPISDK(method, data, callback, restType, port, methodType);
			}

            //请确保回调方法cbError不管发生任何错误都去执行
            if (typeof cbError === 'function') {
                cbError(result);
            }
        }
	});
}

/**
 * 获取设备列表
 * @param callback
 */
function queryDeviceList(callback){
	restCivilAPISDK("civil.device.GetDeviceList",{"mode":"bind","filter":[]},callback);
}

/**
 * 判断用户是否存在
 * @param usernameOrPhoneNumber
 * @param callback
 */
function isUserExists(usernameOrPhoneNumber,callback){
	restCivilAPISDK("civil.user.IsUserExists",{"usernameOrPhoneNumber":usernameOrPhoneNumber},callback); 
}

/**
 * 用户登陆
 * @param callback
 */
function userLogin(callback){
	restCivilAPISDK("civil.user.UserLogin",{"clientName":"exe","appId":null},callback);
}

/**
 * 用户登出
 * @param callback
 */
function userLogout(callback){
	restCivilAPISDK("civil.user.UserLogout",{},callback);
}

/**
 * 用户名信息
 * @param callback
 */
function UsersInfo(callback){
	restCivilAPISDK("civil.user.GetUserInfo",{},callback);
}

/**
 * 获取验证码到手机
 * @param phoneNumber
 * @param callback
 */
function getValidCodeToPhone(phoneNumber,callback){
	restCivilAPISDK("civil.user.GetValidCodeToPhone",{"phoneNumber":phoneNumber},callback);
}

/**
 * 校验验证是否正确
 * @param phoneNumber
 * @param validCode
 * @param callback
 */
function verifyValidCode(phoneNumber,validCode,callback){
	restCivilAPISDK("civil.user.VerifyValidCode",{"phoneNumber":phoneNumber,"validCode":validCode},callback);
}

/**
 * 添加用户
 * @param username
 * @param phoneNumber
 * @param validCode
 * @param password
 * @param callback
 */
function addUser(phoneNumber,validCode,password,callback){
	restCivilAPISDK("civil.user.AddSubUser",{"password":password,"phoneNumber":phoneNumber,"validCode":validCode},callback);
}

/**
 * 修改密码
 * @param newPassword
 * @param callback
 */
function modifyPassword(newPassword,callback){
	restCivilAPISDK("civil.user.ModifyPassword",{"newPassword":newPassword},callback);
}

/**
 * 设备绑定
 * @param deviceId
 * @param callback
 */
function bindDevice(deviceId,callback){
	restCivilAPISDK("civil.device.BindDevice",{"deviceId":deviceId},callback);
}

/**
 * 判定设备是否已经绑定
 * @param deviceId
 * @param callback
 */
function checkDeviceBindOrNot(deviceId,callback){
	var cb = function(respJSON) {
		if (typeof callback === 'function') {
			callback(deviceId, respJSON);
		}
	};

	restCivilAPISDK("civil.device.CheckDeviceBindOrNot",{"deviceId":deviceId},cb);
}

/**
 * 判定设备是否已经绑定
 * @param deviceId
 * @param callback
 */
function DeleteDeviceShare(deviceId,channelId,username,callback){
	restCivilAPISDK("civil.device.DeleteDeviceShare",{"deviceId":deviceId,"channelId":channelId,"username":username},callback);
}

/**
 * 更新用户头像
 * @param pic
 * @param callback
 */
function updateUserIcon(pic,callback){
	restCivilAPISDK("civil.user.UpdateUserIcon",{"pic":pic},callback);
}

/**
 * 添加子用户
 * @param count
 * @param username
 * @param password
 * @param phoneNum
 * @param nickName
 * @param remark
 * @param callback
 */
function addChildUser(count,username,password,phoneNum,nickName,remark,callback){
	var childUsers = new Array();
	for(var i=0;i<count;i++){
		var childUser = {
			"username":username[i],
			"password":password[i],
			"nickname":nickName[i],
			"phoneNumber":phoneNum[i],
			"remark":remark[i]
		};
		childUsers[i] = childUser;
	}
	var data = {
			"childUsers":childUsers
	};
	restCivilAPISDK("civil.user.AddChildUser",data,callback);
}

/**
 * 子用户冻结、授权
 * @param count
 * @param username
 * @param mode
 * @param callback
 */
function controlChildUser(count,username,mode,callback){
	var childUsers = new Array();
	for(var i =0;i<count;i++){
		var childUser = {
			"username":username[i],
			"mode":mode[i]
		};
		childUsers[i] = childUser;
	}
	var data = {
		"childUsers":childUsers
	};
	restCivilAPISDK("civil.user.AddChildUser",data,callback);
}

/**
 * 删除子用户
 * @param childUsers
 * @param callback
 */
function delChildUser(childUsers,callback){
	restCivilAPISDK("civil.user.DelChildUser",{"childUsers":childUsers},callback);
}

/**
 * 分享权限
 * @param deviceId
 * @param channelId
 * @param usernames :Array
 * @param functions
 * @param operation :"[int]操作类型，0删除，1增加，2更新"
 * @param callback 
 */
function setDeviceShare(deviceId,channelId,usernames,functions,operation,callback){
	var activeTime = new Date().getTime()/1000;
	var shareInfos = new Array();
//	for(var i in usernames){
//		var sharInfo = {
//			"username":usernames[i],
//			"functions":functions,
//			"activeTime":activeTime,
//			"operation":operation
//		};
//		shareInfos.push(sharInfo);
//	}
	var sharInfo = {
		"username":usernames,
		"functions":functions,
		"activeTime":activeTime,
		"operation":operation
	};
	shareInfos.push(sharInfo);
    var data = {
		"deviceId":deviceId,
		"channelId":channelId,
		"shareInfos": shareInfos
	};
	restCivilAPISDK1("civil.device.SetDeviceShare",data,callback);
}

/**
 * 获取设备分享
 * @param deviceId
 * @param channelId
 * @param callback
 */
function getDeviceShare(deviceId,channelId,callback){
	restCivilAPISDK("civil.device.GetDeviceShare",{"deviceId":deviceId,"channelId":channelId},callback);
}

/**
 * 解除设备绑定
 * @param deviceId
 * @param deleteCloudRecords [bool]是否一起删除该设备的云存储录像
 * @param callback
 */
function unbindDevice(deviceId,deleteCloudRecords,callback){
	restCivilAPISDK("civil.device.UnbindDevice",{"deviceId":deviceId,"deleteCloudRecords":deleteCloudRecords},callback);
}

/**
 * 获取设备升级版本
 * @param deviceIds - 数组
 */
function getDeviceUpgradeVersion(deviceIds,callback){
	restCivilAPISDK("civil.device.GetDeviceUpgradeVersion",{"deviceIds":deviceIds},callback);
}

/**
 * 修改设备名称
 * @param deviceId
 * @param channelId
 * @param name
 * @param callback
 */
function modifyDeviceName(deviceId,channelId,name,callback){
	restCivilAPISDK("civil.device.ModifyDeviceName",{"deviceId":deviceId,"channelId":channelId,"name":name},callback);
}

/**
 * 查询云存储某年某月的录像覆盖的掩码
 * @param deviceId
 * @param channelId
 * @param year
 * @param month
 * @param callback
 */
function queryCloudRecordBitmap(deviceId,channelId,year,month,callback,errCallback){
	restCivilAPISDK("civil.storage.QueryCloudRecordBitmap",{"deviceId":deviceId,"channelId":channelId,"year":year,"month":month},callback,errCallback);
}

/**
 * 按条件查询录像条数
 * @param deviceId
 * @param channelId
 * @param beginTime
 * @param endTime
 * @param callback
 */
function queryRecordsNum(deviceId,channelId,beginTime,endTime,callback){
	var data = {
		"deviceId":deviceId,
		"channelId":channelId,
		"beginTime":beginTime,
		"endTime":endTime
	};
	restCivilAPISDK("civil.storage.QueryCloudRecordNum",data,callback);
}

/**
 * 按条件查询所有录像记录
 * @param deviceId
 * @param channelId
 * @param beginTime
 * @param endTime
 * @param need
 * @param callback
 */
function queryCloudRecords(deviceId,channelId,beginTime,endTime,need,callback){
	var data = {
		"deviceId":deviceId,
		"channelId":channelId,
		"beginTime":beginTime,
		"endTime":endTime,
		"need":need
	};
	restCivilAPISDK("civil.storage.QueryCloudRecords",data,callback);
}

/**
 * 根据云录像URL转换找到码流
 * @param recordPath 云录像URL
 * @param callback
 */
function generateRecordUrlByPath(recordPath,callback){
	var data = {
		"recordPath":recordPath
	};
    restCivilAPISDK("civil.storage.GenerateRecordUrlByPath", data, callback);
}

/**
 * 根据云录像ID转换找到码流
 * @param recordId 云录像URL
 * @param callback
 */
function generateRecordUrlById(recordId,callback){
	var data = {
		"recordId":recordId
	};
    restCivilAPISDK("civil.storage.GenerateRecordUrlById", data, callback);
}

/**
 * 获取通道的套餐
 * @param deviceId
 * @param channelId
 * @param callback
 */
function getStorageStrategy(deviceId,channelId,callback){
	var data = {
		"deviceId":deviceId,
		"channelId":channelId
	};
	restCivilAPISDK("civil.storage.GetStorageStrategy",data,callback);
}

/**
 * 修改设备封面图
 * @param deviceId
 * @param channelId
 * @param pictureType
 * @param pictureData
 * @param callback
 */
function uploadDeviceCoverPicture(deviceId,channelId,pictureType,pictureData,callback){
	var data = {
		"deviceId": deviceId,
		"channelId": channelId,
		"pictureType": pictureType,
		"pictureData": pictureData
	};
	restCivilAPISDK("civil.device.UploadDeviceCoverPicture",data,callback);
}

/**
 * 获取过滤的设备列表
 * @param mode
 * @param filter
 * @param callback
 */
function getFilterDeviceList(filter,callback){
	var data = {
		"mode":"unbind",
		"filter":filter
	};
	restCivilAPISDK("civil.device.GetDeviceList",data,callback);
}

//-------------------------DMS交互----------------------------------
/**
 *  从dms获取设备rtsp url
 *  channel_id:通道号
 *  stream_id：主副码流编号0或1
 *  record_id：文件名
 *  starttime: 从1970年来秒数
 *  sub-stream:是否加密
 *  type:播放类型 - video：实时视频，playback_file：按文件回放,playback_time:按时间回放,talk:对讲
 */
function getTransferStream(devId,type,dmsPort,callback,channel_id,stream_id,record_id,starttime,sub_stream){
	var optional = "";
	if(type == "video"){
		//实时视频
		optional = "/real/"+channel_id+"/"+stream_id;
	}else if(type == "playback_file"){
		//按文件回放
		optional = "/playback/"+record_id;
	}else if(type == "playback"){
		//按时间回放
		optional = "/playback/"+channel_id+"/"+starttime;
	}else if(type == "talk"){
		//对讲
		optional = "/talk";
	}
	if(sub_stream){
		optional+="/encrypt";
	}
	var dmsUrl  = "/device/"+devId+"/transfer-stream"+optional;
	//console.log(dmsUrl);
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 获取设备wifi列表
 * @param devId
 * @param callback
 * @param dmsPort
 */
function getWifiStatus(devId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/wifi";
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 打开wifi
 * @param devId
 * @param dmsPort
 * @param callback
 */
function enableWifi(devId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/wifi-on";
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"POST");
}

/**
 * 连接wifi
 * @param devId
 * @param SSID
 * @param dmsPort
 * @param callback
 */
function connectWifi(devId,SSID,BSSID,LinkEnable,Password,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/wifi/"+SSID;
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+"<body><BSSID>"+BSSID+"</BSSID><LinkEnable>"+LinkEnable+"</LinkEnable><Password>"+Password+"</Password></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}

/**
 * 获取设备情景模式
 * @param devId
 * @param channelId
 * @param dmsPort
 * @param callback
 */
function getSceneModes(devId,channelId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/scene/"+channelId;
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 获取设备当前模式
 * @param devId
 * @param channelId
 * @param dmsPort
 * @param callback
 */
function getSceneModeNow(chn,callback){
	var devId =  chn.deviceId;
	var channelId = chn.channelId;
	var dmsPort = chn.dms;
	var dmsUrl = "/device/"+devId+"/scene-now/"+channelId;
	
	var cb = function(respJSON) {
		if (typeof callback === 'function') {
			callback(chn, respJSON);
		}
	};
	
	restDmsAPISDK(dmsUrl,null,cb,dmsPort,"GET");
}

/**
 * 设置设备情景模式
 * @param devId
 * @param channelId
 * @param rules
 * @param dmsPort
 * @param callback
 */
function setSceneModes(devId,channelId,rules,dmsPort,callback){
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body>";
	for(var i in rules){
		var rule = rules[i];
		data +="<Rule><Mode>nervous</Mode><State>true</State><Period>"+rule.Period+"</Period><BeginTime>"+rule.BeginTime+"</BeginTime><EndTime>"+rule.EndTime+"</EndTime></Rule>";
	}
	data+="</body>";
	var dmsUrl = "/device/"+devId+"/scene/"+channelId;
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}

/**
 * 获取设备录像掩码
 * @param devId
 * @param callback
 */
function getRecordBitmap(devId,channelId,year,month,dmsPort,callback,cbError){
	var dmsUrl = "/device/"+devId+"/record-bitmap";
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+"<body><ChannelID>"+channelId+"</ChannelID><Year>"+year+"</Year><Month>"+month+"</Month></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST",cbError);
}

/**
 * 获取设备录像数量
 * @param devId
 * @param channelId
 * @param beginTime
 * @param endTime
 * @param dmsPort
 * @param callback
 */
function getDevRecordsNum(devId,channelId,beginTime,endTime,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/record-num";
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body><ChannelID>"+channelId+"</ChannelID><Type>All</Type><BeginTime>"+beginTime+"</BeginTime><EndTime>"+endTime+"</EndTime></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}

/**
 * 获取设备录像条目
 * @param devId
 * @param channelId
 * @param beginTime
 * @param endTime
 * @param need
 * @param dmsPort
 * @param callback
 */
function getDevRecords(devId,channelId,beginTime,endTime,need,dmsPort,callback,cbError){
	var dmsUrl = "/device/"+devId+"/records";
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body><ChannelID>"+channelId+"</ChannelID><Type>All</Type><BeginTime>"+beginTime+"</BeginTime><EndTime>"+endTime+"</EndTime><Need>"+need+"</Need></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST",cbError);
}

/**
 * 获取报警音效果
 * @param devId
 * @param channelId
 * @param Sound
 * @param dmsPort
 * @param callback
 */
function getAlarmEffect(devId,channelId,dmsPort,callback){
	//var dmsUrl = "/device/"+devId+"/alarm-effect/"+channelId;
	var dmsUrl = "/device/"+devId+"/alarm-effect";
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 设置报警音效果
 * @param devId
 * @param channelId
 * @param sound
 * @param dmsPort
 * @param callback
 */
function setAlarmEffect(devId,channelId,sound,dmsPort,callback){
	//var dmsUrl = "/device/"+devId+"/alarm-effect/"+channelId;
	var dmsUrl = "/device/"+devId+"/alarm-effect";
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body><Sound>"+sound+"</Sound></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}

/**
 * 初始化SD卡
 * @param devId
 * @param channelId
 * @param callback
 */
function initSdCard(devId,channelId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/sdcard-recover/"+channelId;
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"POST");
}

/**
 * 设置画面颠倒状态
 * @param devId
 * @param channelId
 * @param dmsPort
 * @param callback
 */
function directionReverse(devId,channelId,dmsPort,direction,callback){
	var dmsUrl = "/device/"+devId+"/frame-params/"+channelId;
	var data =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body><Direction>"+direction+"</Direction></body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}

/**
 * 获取画面颠倒状态
 * @param devId
 * @param channelId
 * @param dmsPort
 * @param callback
 */
function getFrameParameters(devId,channelId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/frame-params/"+channelId;
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 升级设备
 * @param devId
 * @param packageUrl
 * @param dmsPort
 * @param callback
 */
function upgradeDeviceByCallback(devId,packageUrl,dmsPort,version,callback){
	var dmsUrl = "/device/"+devId+"/upgrade";
	var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body><Package>"+packageUrl+"</Package></body>";
	
	var cb = function() {
		if (typeof callback === 'function') {
			callback(devId, dmsPort, version);
		}
	};
	
	restDmsAPISDK(dmsUrl,data,cb,dmsPort,"POST");
}

/**
 * 获取升级设备进度
 * @param devId
 * @param dmsPort
 * @param callback
 */
function upgradeProgress(devId,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/upgrade-progress";
	restDmsAPISDK(dmsUrl,null,callback,dmsPort,"GET");
}

/**
 * 获取升级设备进度(回调中更新升级进度)
 * @param devId
 * @param dmsPort
 * @param callback
 */
function upgradeProgressByCallback(devId,dmsPort,version,callback) {
	var dmsUrl = "/device/"+devId+"/upgrade-progress";
	
	var upgradeCb = function(result) {
		if (typeof callback === 'function') {
			callback(devId, dmsPort, version, result);
		}
	};
	
	restDmsAPISDK(dmsUrl,null,upgradeCb,dmsPort,"GET");
}

/**
 * 云台控制
 * @param devId
 * @param channelId
 * @param dmsPort
 * @param callback
 */
function controlPTZ(devId,channelId,options,dmsPort,callback){
	var dmsUrl = "/device/"+devId+"/ptz/"+channelId;
	var ptzInfo = "<Operation>"+options.Operation+"</Operation>";
	ptzInfo += "<H>"+options.H+"</H><V>"+options.V+"</V>";
	ptzInfo += "<Z>"+options.Z+"</Z><Duration>"+options.Duration+"</Duration>";
	
    var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><body>"+ptzInfo+"</body>";
	restDmsAPISDK(dmsUrl,data,callback,dmsPort,"POST");
}