
	var Utils = {
		datetimeToUnix: function(datetime) { //参数格式：2011-11-11 11:11:11
		    var tmp = datetime.replace(/:/g, '-').replace(/ /g, '-');
		    var arr = tmp.split('-');
		    var now = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
		    return ~~(now.getTime() / 1000);
		},
		formatSeconds: function(totalSec){
			var days = parseInt(totalSec / 86400, 10);
	        var hours = parseInt(totalSec % 86400 / 3600, 10) % 24;
	        var minutes = parseInt(totalSec / 60, 10) % 60;
	        var seconds = totalSec % 60;
	        return (days + '\u5929' + hours + '\u5c0f\u65f6' + minutes + '\u5206' + seconds + '\u79d2');
		},
		/**
		 * @method isMobile 检测是否移动端
		 * @private
		 */
		isMobile: function(){
			var ua = navigator.userAgent.toLowerCase(),
	            os = ['android', 'iphone', 'symbianos', 'windows phone', 'ipod', 'blackberry', '17173_', '17173gl', 'appjiaoyi'],
	            mobile = false;
	        for (var i = 0; i < os.length; i++) {
	            if (ua.indexOf(os[i]) > -1) {
	                mobile = true;
	                break;
	            }
	        }
	        return mobile;
		},
		base64_encode: function(str){
		    var c1, c2, c3;
		    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';                
		    var i = 0, len= str.length, string = '';
		    while (i < len){
		            c1 = str.charCodeAt(i++) & 0xff;
		            if (i == len){
		                    string += base64EncodeChars.charAt(c1 >> 2);
		                    string += base64EncodeChars.charAt((c1 & 0x3) << 4);
		                    string += '==';
		                    break;
		            }
		            c2 = str.charCodeAt(i++);
		            if (i == len){
		                    string += base64EncodeChars.charAt(c1 >> 2);
		                    string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		                    string += base64EncodeChars.charAt((c2 & 0xF) << 2);
		                    string += '=';
		                    break;
		            }
		            c3 = str.charCodeAt(i++);
		            string += base64EncodeChars.charAt(c1 >> 2);
		            string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		            string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		            string += base64EncodeChars.charAt(c3 & 0x3F)
		    }
		    return string;
		},
	    getCookie: function(name) {
	        var start = document.cookie.indexOf(name + "=");
	        var len = start + name.length + 1;
	        if ((!start) && (name != document.cookie.substring(0, name.length))) {
	            return null;
	        }
	        if (start == -1) return null;
	        var end = document.cookie.indexOf(';', len);
	        if (end == -1) end = document.cookie.length;
	        return unescape(document.cookie.substring(len, end));
	    }
	}
	window.getCookie = Utils.getCookie;

	module.exports = Utils;

