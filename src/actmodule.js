	/**
	* 通用活动组件 
	* @module ActModule
	*/

	var $ = window.$ = window.jQuery = require('jquery'),
		Core = require('./core'),
		Utils = require('./utils'),
		ZeroClipboard = window.ZeroClipboard = require('./jquery.zclip');

	/**
	* 表现层类
	*
	* @class ActModule
	* @constructor
	*
	* @example
	* ```
    * new ActModule({
    *     element: '#act',
    *     actId: 4959, //活动ID
    *     lotteryId: 62, //抽奖ID
    *     style: 1, //样式
    *     voteId: 10132, //投票ID
    *     needComment: true, //是否需要评论
    *     commentTip: '这里你要评论下', //评论导语
    *     fieldSetId: 39, //收集信息的表单ID
    *     needInfo: true //是否需要填写个人信息
    * });
	* ```
	*/
	var ActModule = Core.extend({
	    /**
	     * 默认参数
	     *
	     * @property {object} defaults 默认参数
	     * @type {object}
	     */

		defaults: {
			delegates: {
				'click #zq_actcompt_in_progress': function(e){
					if($(e.currentTarget).hasClass('disabled')){
						return;
					}
					this.startFromHere();
				},
				'click #submit_vote': function(e){
					if($(e.currentTarget).hasClass('disabled')){
						return;
					}
					this.submitVote(e.currentTarget);
				},
				'click .zq-actcompt-pop-close': function(e){
					this.closePopup(e);
				},
				'click #za_actcompt_captcha': function(e){
					this.imageCaptchaRefresh();
				},
				'click .zq-actcompt-votelist-item': function(e){
					this.handleVoteOptions(e.currentTarget);
				},
				'click #submit_image_captcha': function(e){
					this.submitImageCaptcha();
				},
				'click #submit_comment': function(e){
					if($(e.currentTarget).hasClass('disabled')){
						return;
					}
					this.submitComment();
				},
				'click #send_sms': function(e){
					if($(e.currentTarget).hasClass('lottery-btn-sendcode-disabled')){
						return;
					}
					this.validateMobile();
				},
				'click .zq-actcompt-pop-btn-send': function(e){
					if($(e.currentTarget).parent().hasClass('sms-send-success')){
						return;
					}
					this.validateMobile();
				},
				'click #submit_sms': function(e){
					this.submitSms();
				},
				'keyup .zq-actcompt-form-input input': function(e){
					this.inputKeyupHandler(e);
				},
				'click #cancel_submit_info': function(e){
					$(e.currentTarget).parents('.zq-actcompt-pop').find('.zq-actcompt-pop-close').trigger('click');
				},
				'click #submit_info': function(e){
					this.submitInfo();
				},
				'click #btn_fill_info': function(){
					this.element.find('#result_pop, .zq-actcompt-pop-mask').remove();
					this.showInfoPop();
				},
				'submit #image_captcha_form': function(e){
					e.preventDefault();
				},
				'focus #captcha_input, #mobile_input, #sms_input': function(e){
					this.onPlaceholderFocus(e);
				},
				'blur #captcha_input, #mobile_input, #sms_input': function(e){
					this.onPlaceholderBlur(e);
				},
				'click .xcaptcha_img_change': function(e){
					if (this.chartIndex.length == 4) {
						return false;
					}
		            this.imageCaptchaRefresh();
				},
				'click .xcaptcha_backspace': function(){
		            if (this.chartIndex.length == 0 || this.chartIndex.length == 4) {
		            	return false;
		            }
		            this.chartIndex.pop();
		            $(".xcaptcha_grid_input div").eq(this.chartIndex.length).removeAttr("style");
				},
				'click .xcaptcha_grid_buttons div': function(e){
					this.chooseCaptcha(e);
				},
				'click #zq-actcompt-validate-img': function(e){
					this.refresh17173CommentImage(e);
				}

			}
		},
		setup: function(){
			ActModule.superclass.setup.apply(this);

			if(this.mobile){
				$('<link rel="stylesheet" href="http://ue.17173cdn.com/a/module/zq/2015/act-lottery/m/css/style.css"><link rel="stylesheet" href="http://ue.17173cdn.com/a/hao/xcaptcha/xcaptcha-0.1.0.css">').appendTo("head");
				$.getScript('http://passport.17173.com/themes/default/static/js/topbar/topbar.js', function(){
					window.wap.init();
				});
			} else{
				typeof Passport === 'undefined' && $.getScript('http://ue.17173cdn.com/a/www/index/2015/js/passport.js');
				$('<link rel="stylesheet" href="http://ue.17173cdn.com/a/module/zq/2015/act-lottery/css/layout.css"><link rel="stylesheet" href="http://ue.17173cdn.com/a/hao/xcaptcha/xcaptcha-0.1.0.css">').appendTo("head");
			}
			$(this.element).html('');
			this.chartIndex = [];
		},


	    /**
	     * @method getTemplates 引入模板
	     *
	     */
		getTemplates: function(){
			this.templates = {
				pc: {
					template1: require('./template/pc/style1.handlebars'),
					template2: require('./template/pc/style2.handlebars'),
					template3: require('./template/pc/style3.handlebars'),
					template4: require('./template/pc/style4.handlebars'),
					comment: require('./template/pc/comment.handlebars'),
					imageCaptcha: require('./template/pc/imageCaptcha.handlebars'),
					info: require('./template/pc/info.handlebars'),
					result: require('./template/pc/result.handlebars'),
					SMS: require('./template/pc/sms.handlebars'),
					vote: require('./template/pc/vote.handlebars')
				},
				mobile: {
					template1: require('./template/m/style1.handlebars'),
					template2: require('./template/m/style2.handlebars'),
					template3: require('./template/m/style3.handlebars'),
					comment: require('./template/m/comment.handlebars'),
					imageCaptcha: require('./template/m/imageCaptcha.handlebars'),
					info: require('./template/m/info.handlebars'),
					result: require('./template/m/result.handlebars'),
					SMS: require('./template/m/sms.handlebars'),
					vote: require('./template/m/vote.handlebars')
				}
			}
		},

		/**
		 * @method closePopup 关闭弹出框
		 * @param  {object}   e 事件对象
		 */
		closePopup: function(e){
			if(this.mobile){
				$(e.currentTarget).parents('.zq-actcompt-pop').remove();
			} else{
				var $popup = $(e.currentTarget).parent(),
					$mask = $popup.next('.zq-actcompt-pop-mask');
				$popup.remove();
				$mask.remove();				
			}
		},

		/**
		 * @method checkStatus 判断活动状态
		 * @return {object} 返回的对象会加到接口的活动数据里，填充到handlebars模板里
		 * @param  {String}   beginTime 开始时间 yyyy-mm-dd hh:mm:ss
		 * @param  {String}   endTime 结束时间 yyyy-mm-dd hh:mm:ss
		 * @param  {Number}   timestamp 当前服务器时间
		 * @private
		 */
		checkStatus: function(beginTime, endTime, timestamp){
			var beginTimeUnix = Utils.datetimeToUnix(beginTime),
				endTimeUnix = Utils.datetimeToUnix(endTime),
				nowUnix = timestamp,
				winnerUrl = this.option('winnerUrl') ? this.option('winnerUrl') : false;

			if(nowUnix < beginTimeUnix){
				return {
					timeLeft: beginTimeUnix - nowUnix,
					notYetStart: true,
					winnerUrl: winnerUrl
				};
			}
			if(nowUnix > endTimeUnix){
				return {
					ended: true,
					winnerUrl: winnerUrl
				};
			}
			return {
				inProgress: true,
				timeLeft: 0,
				winnerUrl: winnerUrl
			};
		},

		/**
		 * @method render 渲染组件。 活动开始结束时间说明：1.人工抽奖的情况下，读取活动信息接口里的beginTime/endTime; 2.即时抽奖读取抽奖信息接口里的 startTime/endTime
		 * @param  {object}   actInfo 活动数据
		 */		
		render: function(actInfo){
			var self = this,
				startTime = this.option('collectInfo') ? actInfo.beginTime : actInfo.lotteryBeginTime,
				endTime = this.option('collectInfo') ? actInfo.endTime : actInfo.lotteryEndTime;

			this.endTime = Utils.datetimeToUnix(endTime);
			actInfo.status = self.checkStatus(startTime, endTime, actInfo.timestamp);

			if(this.option('style') == 4 && this.mobile){
				console.error('样式4不支持移动端。');
				return;
			}

			self.reset(actInfo);

			if(!actInfo.status.ended){
				self.initAct();
			}

			//活动未开始
			if(actInfo.status.notYetStart){
				var timeElement = this.mobile ? '.many' : '.zq-actcompt-or';
				var timeLeft = actInfo.status.timeLeft;
				self.element.find(timeElement).text(Utils.formatSeconds(timeLeft));
				var timeInterval = setInterval(function(){
					timeLeft--;
					self.element.find(timeElement).text(Utils.formatSeconds(timeLeft));
					if(timeLeft <= 0){
						clearInterval(timeInterval);
						self.reset(actInfo, 'inProgress');
					}
				}, 1000);
			}

			//如果当前时间在活动结束前一个小时内，开始倒计时
			if(actInfo.status.inProgress){
				var tl = Utils.datetimeToUnix(endTime) - actInfo.timestamp;
				if(tl < 3600){
					var endInterval = setInterval(function(){
						tl--;
						if(tl <= 0){
							clearInterval(endInterval);
							self.reset(actInfo, 'ended');
						}
					}, 1000);
				}
			}
		},

		/**
		 * @method reset 设置组件状态
		 * @param  {Object}   actInfo 组件数据.
		 * @param  {Boolean}   status 组件状态. 'inProgress': 活动开始, 'ended':活动结束
		 */			
		reset: function(actInfo, status){
			this.element.html('');

			if(status == 'inProgress'){
				actInfo.status.inProgress = true;
				actInfo.status.notYetStart = false;
				actInfo.status.ended = false;
			} else if(status == 'ended'){
				actInfo.status.inProgress = false;
				actInfo.status.notYetStart = false;
				actInfo.status.ended = true;
			}

			switch(+this.option('style')){
				case 1:
					$(this.templates[this.platform].template1(actInfo)).appendTo(this.element);
					break;
				case 2:
					$(this.templates[this.platform].template2(actInfo)).appendTo(this.element);
					break;
				case 3:
					$(this.templates[this.platform].template3(actInfo)).appendTo(this.element);
					break;
				case 4:
					$(this.templates[this.platform].template4(actInfo)).appendTo(this.element);
					break;															
			}
		},

		/**
		 * @method showVotePop 显示投票弹窗
		 */
		showVotePop: function(){
			if($('#vote_pop').length < 1){
				this.renderVote();
			}
			$('#vote_pop, .zq-actcompt-pop-mask').show();
		},

		/**
		 * @method renderVote 加载投票模板
		 * @param  {object}   data 投票数据
		 */			
		renderVote: function(){
			$(this.templates[this.platform].vote(this.voteJSON)).appendTo(this.element);
		},

		/**
		 * @method handleVoteOptions 处理点击投票选项
		 * @param  {object}   option 当前点击的投票元素
		 */				
		handleVoteOptions: function(option){
			//如果是单选
			if($(option).parents('[data-voteid]').data('votetype') == 0){ 
				if(!$(option).hasClass('on')){
					$(option).addClass('on').siblings().removeClass('on');
				}
			} 
			//如果是多选
			else{
				$(option).hasClass('on') ? $(option).removeClass('on') : $(option).addClass('on');
			}
		},

		/**
		 * @method submitVote 提交投票
		 * @param  {object}   submit 投票按钮元素
		 */			
		submitVote: function(submit){
			var self = this;
			var $vote = $(submit).parents('[data-voteid]'); 
			if($vote.find('.on').length < 1){
				alert('请选择一个选项');
				return;
			}
			$(submit).addClass('disabled').text('提交中...');
			var voteid = $vote.data('voteid'),
				voteitem = [];
			$vote.find('.on').each(function(){
				voteitem.push($(this).data('itemid'));
			});
			var data = {
				voteitem: voteitem.join(),
				voteid: voteid
			};
			self.doVote(data);
		},

		/**
		 * @method voteSuccess 投票成功的回调函数，提交后隐藏投票弹窗，然后检查是否登录
		 */
		voteSuccess: function(){
			$('#vote_pop, .zq-actcompt-pop-mask').remove();
			if(this.option('collectInfo')){
				this.showInfoPop(true);
			} else{
				this.needLoggedIn ? this.checkLogin() : this.checkInfo();
			}
		},

		/**
		 * @method showCommentPop 显示评论弹窗
		 */	
		showCommentPop: function(){
			//如果页面里没有畅言评论，跳过评论
			// var sid = $('#SOHUCS').attr('sid');
			// if(!sid){
			// 	this.commentSuccess();
			// 	return;
			// }

			if($('[data-widget-sid]').length && $('[data-widget-sid]').attr('data-widget-sid') && $('[data-widget-sid]').attr('data-widget') == 'comment'){
				this.sid = $('[data-widget-sid]').attr('data-widget-sid');
				this.cyan = false;				
			} else if($('#SOHUCS').length && $('#SOHUCS').attr('sid')){
				this.sid = $('#SOHUCS').attr('sid');
				this.cyan = true;			
			} else if($('[data-widget-sid]').length && $('[data-widget-sid]').attr('data-widget-sid') && $('[data-widget-sid]').attr('data-widget') == 'changyan'){
				this.sid = $('[data-widget-sid]').attr('data-widget-sid');
				this.cyan = true;
			} else{
				console.error('在后台勾了需要评论前台页面就要加畅言或者173评论组件知道了不!!!');
				return;
			}

			var self = this,
				showValidateCode = !this.isLoggedIn() && !this.cyan,
				data = {commentTip: self.option('commentTip'), showValidateCode: showValidateCode};

			$('#comment_pop').length ? $('#comment_pop, .zq-actcompt-pop-mask').show() : $(self.templates[self.platform].comment(data)).appendTo(this.element);
			if(showValidateCode){
				this.getCommentNickname();
				this.refresh17173CommentImage();
			} 
		},

		/**
		 * @method submitComment 提交评论
		 */
		submitComment: function(){
			var self = this,
				val = $.trim($('#comment_text').val());
			if(val === ''){
				alert('请输入评论内容');
				return;
			}

			$('#submit_comment').addClass('disabled').text('提交中...');
			this.doComment(val, self.sid);
		},

		/**
		 * @method commentSuccess 评论成功的回调函数, 删除评论弹窗并检查登录状态
		 */	
		commentSuccess: function(){
			$('#comment_pop, .zq-actcompt-pop-mask').remove();
			if(this.option('collectInfo')){
				this.showInfoPop(true);
			} else{
				this.needLoggedIn ? this.checkLogin() : this.checkInfo();
			}
		},

		/**
		 * @method checkLogin 检查是否登录
		 */	
		checkLogin: function(){
			var self = this;
			if(this.inApp){
				if(Utils.getCookie('ppinf17173')){
					this.checkInfo();
				} else{
					location.href = "app.17173://passport/login?rediretUrl=" + location.href;
				}
			} else if(this.mobile){
				if(!wap){
					return;
				}
				if(wap.isLogin()){
					this.checkInfo();
				} else{
					wap.on('loginSuccess', function(){
						self.checkInfo();
					});
					wap.show();
				}
			} else{
				if(this.isLoggedIn()){
					this.checkInfo();
				} else{
					var loginSuccessHandler = function(){
						self.checkInfo();
					}
					Passport.on('loginSuccess', loginSuccessHandler);
					Passport.off(loginSuccessHandler);
					Passport.Dialog.show();
				}
			}
		},

		/**
		 * @method showSmsPop 显示短信验证码弹窗
		 */
		showSmsPop: function(){
			$(this.templates[this.platform].SMS()).appendTo(this.element);
		},

		/**
		 * @method validateMobile 验证手机号码格式
		 */	
		validateMobile: function(){
			var reMobile = /^1\d{10}$/,
				mobile = $('#mobile_input').val();
			if(!reMobile.test(mobile)){
				alert('请输入正确的手机号码');
				return;
			}
			this.sendSms(mobile);
		},

		/**
		 * @method smsSendSuccess 短信下发成功的回调函数
		 */		
		smsSendSuccess: function(){
			var el = this.mobile ? '#sms_pop .zq-actcompt-form-item-ex1' : '#send_sms';
			this.mobile ? $(el).addClass('sms-send-success') : $(el).addClass('lottery-btn-sendcode-disabled')

			var timeleft = 120;
			var resendInterval = setInterval(function(){
				$('#sms_time_left').text(--timeleft);
				if(timeleft <= 0){
					clearInterval(resendInterval);
					$(el).removeClass('lottery-btn-sendcode-disabled sms-send-success');
					$('#sms_time_left').text('120');
				}
			}, 1000);
			$('#sms_pop .zq-actcompt-pop-close').click(function(){
				clearInterval(resendInterval);
			})
		},

		/**
		 * @method submitSms 提交短信验证码
		 */	
		submitSms: function(){
			var sms = $('#sms_input').val();
			if(!this.smsSended){
				alert('请先获取短信验证码');
				return;
			}
			if(sms.length !== 4){
				alert('请输入4位验证码');
				return;
			}
			this.doLottery({captcha: sms});
		},

		/**
		 * @method showInfoPop 显示个人信息弹窗
		 */		
		showInfoPop: function(collectInfo){
			var self = this;
			var data = {
				collectInfo: collectInfo ? true : false,
				fieldSet: self.fieldSet
			}
			$(this.templates[this.platform].info(data)).appendTo(this.element);
			this.element.find('[name=comment]').val(this.commentContent || '/');
		},

		/**
		 * @method submitInfoSuccess 个人信息提交成功的回调. 有三种情况：1 人工抽奖 2 在抽奖流程里，提交后进入填验证码步骤 3 配置了不需要收集信息，但是抽奖结果为实物时
		 */
		submitInfoSuccess: function(){ 
			$('#info_pop, .zq-actcompt-pop-mask').remove();

			if(this.option('collectInfo')){
				this.join();
				this.addJoinNumber();
				alert('您的信息已经成功提交。' + this.option('collectInfoTip'));
			} else if(this.option('needInfo')){
				this.checkValidate();
			} else{
				alert('您的信息已经成功提交。');
			}
		},

		/**
		 * @method actClose 活动结束的回调
		 */		
		actClose: function(){
			$('#info_pop, .zq-actcompt-pop-mask').remove();
		},

		/**
		 * @method validateInfoForm 验证个人信息表单
		 * @return {object} formData验证通过返回表单数据 {boolean} 验证失败返回false
		 */				
		validateInfoForm: function(){
			var pass = true,
				formData = {},
				reMail = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
				reMobile = /^1\d{10}$/,
				reQQ = /^[1-9]\d{4,11}$/,
				$input = this.mobile ? $('.zq-actcompt-form-input') : $('.zq-actcompt-form-input input');

			$input.each(function(){
				var val = $.trim($(this).val()),
					name = $(this).attr('name'),
					cName = $(this).parents('.zq-actcompt-form-item').find('[data-name]').text(),
					$error = this.mobile ? $(this).parent().next('.zq-actcompt-form-error') : $(this).parents('.zq-actcompt-form-item').next('.zq-actcompt-form-error'),
					$errorText = this.mobile ?  $error.find('span') : $error;
				if(val === ''){
					$error.show();
					$errorText.text('请填写您的' + cName);
					pass = false;
				} else if(name === 'email' && !reMail.test(val)){
					$error.show();
					$errorText.text('请输入正确的' + cName);
					pass = false;				
				} else if(name === 'phone' && !reMobile.test(val)){
					$error.show();
					$errorText.text('请输入正确的' + cName);
					pass = false;
				} else if(name === 'qq' && !reQQ.test(val)){
					$error.show();
					$errorText.text('请输入正确的' + cName)
					pass = false;
				} else{
					$error.hide();
					$errorText.text('');
					formData[name] = val;
				}
			});
			if(pass){
				return formData;
			} else{
				return false;
			}
		},

		/**
		 * @method inputKeyupHandler 处理输入框keyup事件
		 * @param  {Object}   e 事件对象
		 */	
		inputKeyupHandler: function(e){
			if(this.mobile){
				$(e.currentTarget).parent().next('.zq-actcompt-form-error').hide().find('span').text('');
			} else{
				$(e.currentTarget).parents('.zq-actcompt-form-item').next('.zq-actcompt-form-error').hide().text('');
			}
		},

		/**
		 * @method onPlaceholderFocus 处理输入框Focus事件
		 * @param  {Object}   e 事件对象
		 */	
		onPlaceholderFocus: function(e){
			var val = $(e.currentTarget).val();
			if(val == '请输入手机号码' || val == '请输入验证码'){
				$(e.currentTarget).val('');
			}
		},

		/**
		 * @method onPlaceholderBlur 处理输入框Blur事件
		 * @param  {Object}   e 事件对象
		 */	
		onPlaceholderBlur: function(e){
			var val = $(e.currentTarget).val(),
				id = $(e.currentTarget).attr('id');
			if(val == '' && (id == 'sms_input' || id == 'captcha_input')){
				$(e.currentTarget).val('请输入验证码');
			} else if(val == '' && id == 'mobile_input'){
				$(e.currentTarget).val('请输入手机号码');
			}
		},

		/**
		 * @method showImageCaptcha 显示图片验证码弹窗
		 */		
		showImageCaptcha: function(){
			var self = this;

			if($('#captcha_pop').length){
				this.imageCaptchaRefresh();
				$('#captcha_pop, .zq-actcompt-pop-mask').show();
			} else{
				$(this.templates[this.platform].imageCaptcha()).appendTo(this.element);
			}
			this.imageCaptchaRefresh();

		},

		/**
		 * @method chooseCaptcha 点击选择验证码
		 */		
		chooseCaptcha: function(e){
			var self = this;
            if (this.chartIndex.length >= 4) {
            	return false;
            }
            $('.xcaptcha_grid_input div').eq(this.chartIndex.length).css('background-position', $(e.currentTarget).css('background-position'));

            this.chartIndex.push($(e.currentTarget).attr("tabindex"));

            if (this.chartIndex.length == 4) {

                var code = this.chartIndex.join('');
                var captchaUrl = this.urls.captchaCode + '?xcaptcha=validate';

                $.ajax({
                    url: captchaUrl,
                    type: 'GET',
                    data: 'code=' + code,
                    dataType: 'jsonp',
                    cache: false,
                    async: true,
                    success: function(data) {
                        if (data.status != 1) {
                            $(".xcaptcha_help").html("<span style=\"color:red\">\u9a8c\u8bc1\u7801\u8f93\u5165\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165\uff01</span>");
                            setTimeout(function() {
                                self.imageCaptchaRefresh();
                                $(".xcaptcha_help").html("\u70b9\u51fb\u4e0b\u6846\u5185\u6587\u5b57\u4f9d\u6b21\u9009\u51fa\u4e0a\u56fe\u4e2d\u7684\u6c49\u5b57");
                            }, 1000);
                        } else {
                            $('.xcaptcha_status img').show();
                            self.submitImageCaptcha(code);
                            // if (typeof opts.success == 'function') opts.success(code);
                        }
                    }
                });
            }
		},

		/**
		 * @method imageCaptchaRefresh 刷新图片验证码
		 */			
		imageCaptchaRefresh: function(){
			var host = 'http://p.act.' + (this.option('dev') ? 'dev.' : '') + '17173.com';
	        var captchaUrl = this.urls.captchaCode + '?xcaptcha=refresh';
	        this.chartIndex = [];
	        $(".xcaptcha_grid_input div").removeAttr("style");
	        $(".xcaptcha_status img").hide();

	        $.ajax({
	            url: captchaUrl,
	            dataType: 'jsonp',
	            cache: false,
	            async: true,
	            success: function(data) {
	                $('.xcaptcha_full_image').remove();
	                $('body').prepend('<style class="xcaptcha_full_image" type="text/css">.xcaptcha_grid_input div, .xcaptcha_grid_content .xcaptcha_img_wrap, .xcaptcha_grid_buttons div {background: url(' + (host + data.url) + ') -500px -500px no-repeat;}</style>');
	                // so.data('xcaptcha.sudoku.hash', [data.hash1, data.hash2]);
	                if ($(".xcaptcha_component").is(":hidden")) {
	                    $(".xcaptcha_component").show();
	                }
	            }
	        });


			// $('#za_actcompt_captcha').attr('src', '').attr('src', this.host + '/lottery/' + this.option('lotteryId') + '/captchaCode?' + new Date().getTime());
		},

		/**
		 * @method submitImageCaptcha 提交图片验证码
		 */				
		submitImageCaptcha: function(captcha){
			// var self = this,
			// 	captcha = $.trim($('#captcha_input').val());
			// if(captcha.length < 4 || captcha == '请输入验证码'){
			// 	alert('请输入正确的验证码');
			// 	return;
			// }
			this.doLottery({captcha: captcha});
		},

		/**
		 * @method done 处理中奖结果
		 * @param  {object}   data 投票按钮元素
		 * @param  {Number}   resultType 中奖结果类型
		 */	
		done: function(data, resultType){

			if(resultType === 2){
				alert(data.msg);
				return;
			}

			//如果未中奖或者中虚拟奖品，且前置条件有评论，需要自动提交评论信息.
			if((data.failed || (data.success && data.code)) && this.commentContent !== undefined && !this.option('needInfo') && this.fieldSet && this.fieldSet.length > 0){
				var fd = {formData: {}};
				for(var i = 0; i < this.fieldSet.length; i++){
					if(this.fieldSet[i].columnName == 'comment'){
						fd.formData.comment = this.commentContent;
					} else{
						fd.formData[this.fieldSet[i].columnName] = '/';
					}
				}
				fd.formData.comment && $.getJSON(this.urls.saveInfo, fd);
			}

			this.addJoinNumber();

			$('.zq-actcompt-pop, .zq-actcompt-pop-mask').remove();
			if(this.option('style') == 3 && resultType === 1){
				$('#zq_actcompt_in_progress').addClass('disabled');
				this.animateIt(data.prizeId, data, '.zq-actcompt-item');
			} else{
				this.animateEnd(data);
	        	// $(template(data)).appendTo(this.element);
	        	// this.copy();
			}
		},

		/**
		 * @method addJoinNumber 把参与数加1
		 */	
		addJoinNumber: function(){
			if(this.mobile){
				var joins = parseInt(this.element.find('.zq-actcompt-joins').text(), 10);
				this.element.find('.zq-actcompt-joins').text(joins+1);
			} else{
				var joins = parseInt(this.element.find('.zq-actcompt-or').text(), 10);
				this.element.find('.zq-actcompt-or').text(joins+1);
			}
		},

		/**
		 * @method animateEnd 抽奖动画结束后的回调，如无抽奖动画也是直接调用这个
		 * @param  {Object} data 后端返回的抽奖结果
		 */	
		animateEnd: function(data){
			if(data.code){
				data.code = data.code.split('|');
			}
        	$(this.templates[this.platform].result(data)).appendTo(this.element);
        	if(!this.option('needInfo') && !data.code){//实物
        		this.element.find('.zq-actcompt-pop .zq-actcompt-btn-box').show();
        	}
        	!this.mobile && this.copy();
        	$('#zq_actcompt_in_progress').removeClass('disabled');
		},

		/**
		 * @method copy 复制按钮功能
		 */	
		copy: function(){
			if(window.clipboardData){
				$('.btn-copy-code').click(function(){
					var text = $(this).prev('div').find('input').val();
					window.clipboardData.setData('Text', text);
					alert('已复制到剪贴板: ' + text);
				});
				$('#btn_copy_secretkey').click(function(){
					window.clipboardData.setData('Text', $('#act_module_secretkey').val());
					alert('已复制到剪贴板: ' + $('#act_module_secretkey').val());
				});
			} else{
				$('.btn-copy-code').zclip({
					path: 'http://ue.17173cdn.com/a/lib/pandora/actmodule/ZeroClipboard.swf',
					copy: function(){
						var text = $(this).prev('div').find('input').val();
						return text;
					},
					afterCopy: function(){
						var text = $(this).prev('div').find('input').val();
						alert('已复制到剪贴板: ' + text);
					}
				});
				$('#btn_copy_secretkey').zclip({
					path: 'http://ue.17173cdn.com/a/lib/pandora/actmodule/ZeroClipboard.swf',
					copy: function(){
						return $('#act_module_secretkey').val();
					},
					afterCopy: function(){
						alert('已复制到剪贴板: ' + $('#act_module_secretkey').val());
					}
				});	
			}
		}
	});

	module.exports = ActModule;
