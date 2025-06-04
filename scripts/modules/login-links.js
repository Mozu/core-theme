/* globals grecaptcha */

/**
 * Adds a login popover to all login links on a page.
 */
define(['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'hyprlivecontext', 'vendor/jquery-placeholder/jquery.placeholder'],
     function ($, api, Hypr, _, HyprLiveContext) {

    var usePopovers = function() {
        return !Modernizr.mq('(max-width: 480px)');
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {
        return false;
    },    returnUrl = function() {
        var returnURL = $('input[name=returnUrl]').val();
        if(!returnURL) {
            returnURL = '/';
        }
        return returnURL;
    },
    getUrlParameter = function(name) {
        var urlParams = window.location.search.substring(1);
        var urlParamsArray = urlParams.split('&');
        for (var i = 0; i < urlParamsArray.length; i++) {
            var param = urlParamsArray[i].split('=');
            if (param[0] === name) {
                return decodeURIComponent(param[1]) || '';
            }
        }
        return null;
    },
    $docBody,

    polyfillPlaceholders = !('placeholder' in $('<input>')[0]);

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function () {
            for (var i = this.boundMethods.length - 1; i >= 0; i--) {
                this[this.boundMethods[i]] = $.proxy(this[this.boundMethods[i]], this);
            }
        },
        dismisser: function (e) {
            if (!$.contains(this.popoverInstance.$tip[0], e.target) && !this.loading) {
                // clicking away from a popped popover should dismiss it
                this.$el.popover('destroy');
                this.$el.on('click', this.createPopover);
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
            }
        },
        setLoading: function (yes) {
            this.loading = yes;
            this.$parent[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        onPopoverShow: function () {
            var self = this;
            _.defer(function () {
                $docBody.on('click', self.dismisser);
                self.$el.on('click', returnFalse);
            });
            this.popoverInstance = this.$el.data('bs.popover');
            this.$parent = this.popoverInstance.tip();
            this.bindListeners(true);
            this.$el.off('click', this.createPopover);
            if (polyfillPlaceholders) {
                this.$parent.find('[placeholder]').placeholder({ customClass: 'mz-placeholder' });
            }
        },
        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            if (usePopovers()) {
                e.preventDefault();
                // If the parent element's not positioned at least relative,
                // the popover won't move with a window resize
                //var pos = $parent.css('position');
                //if (!pos || pos === "static") $parent.css('position', 'relative');
                this.$el.popover({
                    //placement: "auto right",
                    animation: true,
                    html: true,
                    trigger: 'manual',
                    content: this.template,
                    container: 'body'
                }).on('shown.bs.popover', this.onPopoverShow)
                .popover('show');

            }
        },
        retrieveErrorLabel: function (xhr) {
            var message = "";
            if (xhr.message) {
                message = Hypr.getLabel(xhr.message);
            } else if ((xhr && xhr.responseJSON && xhr.responseJSON.message)) {
                message = Hypr.getLabel(xhr.responseJSON.message);
            }

            if (!message || message.length === 0) {
                this.displayApiMessage(xhr);
            } else {
                var msgCont = {};
                msgCont.message = message;
                this.displayApiMessage(msgCont);
            }
        },
        displayApiMessage: function (xhr) {
            this.displayMessage(xhr.message ||
                (xhr && xhr.responseJSON && xhr.responseJSON.message) ||
                Hypr.getLabel('unexpectedError'));
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
        },
        init: function (el) {
            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            if (!this.pageType) {
                this.$el.on('click', this.createPopover);
            }
            else {
               this.$el.on('click', _.bind(this.doFormSubmit, this));
            }
        },
        doFormSubmit: function(e) {
            e.preventDefault();
            this.$parent = this.$el.closest(this.formSelector);
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow', 'handleLoginResponse', 'switchToOTPLogin'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="recaptchasubmitlogin"]', this.loginRecaptcha.bind(this));
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('click', '[data-mz-action="otploginform"]', this.switchToOTPLogin.bind(this));
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            var me = this;
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');

            if (this.$el.hasClass('mz-forgot')){
                this.slideRight();
            }

            var recaptchaType = HyprLiveContext.locals.themeSettings.recaptchaType;

            var recaptchaContainer = recaptchaType === 'Invisible' ? 'recaptcha-container-global' : 'recaptcha-container-popup';

            if (HyprLiveContext.locals.themeSettings.enableRecaptcha) {
                if (recaptchaType !== 'Invisible' || !window.renderedRecaptcha) {
                    grecaptcha.render(
                        recaptchaContainer,
                        {
                            size: recaptchaType === 'Invisible' ? 'invisible' : 'compact',
                            badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                            theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                            sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                            callback: function(result) {
                                window.captchaToken = result;

                                if (recaptchaType === 'Invisible') {
                                    me.login(result);
                                }
                            }
                        }
                    );
                }
            }

            if (recaptchaType === 'Invisible') {
                window.renderedRecaptcha = true;
            }
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                switch ($parentForm.data('mz-role')) {
                    case "login-form":
                        this.login();
                        break;
                    case "forgotpassword-form":
                        this.retrievePassword();
                        break;
                }
                return false;
            }
        },
        slideRight: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', -this.panelWidth);
        },
        slideLeft: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', 0);
        },
        loginRecaptcha: function() {
            var me = this;

            if (HyprLiveContext.locals.themeSettings.recaptchaType !== 'Invisible') {
                return me.login();
            }

            if (window.captchaToken) {
                return me.login(window.captchaToken);
            }

            if (!window.renderedRecaptcha) {
                grecaptcha.render(
                    'recaptcha-container-global',
                    {
                        size: HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'invisible' : HyprLiveContext.locals.themeSettings.recaptchaSize,
                        badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                        theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                        sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                        callback: function(result) {
                            window.captchaToken = result;
                            me.login(result);
                        }
                    }
                );

                window.renderedRecaptcha = true;
            }

            grecaptcha.execute();
        },        login: function (token) {
            this.setLoading(true);

            //NGCOM-623
            //If a returnUrl has been specified in the url query and there
            //is no returnUrl value provided by the server,
            //we'll use the one specified in the url query. If a returnURl has been
            //provided by the server, it will live in an invisible input in the
            //login links box.            var returnUrl = "";
            var returnUrlParam = getUrlParameter('returnUrl');
            if (returnUrlParam && !this.$parent.find('input[name=returnUrl]').val()){
              returnUrl = returnUrlParam;
            } else {
              returnUrl = this.$parent.find('input[name=returnUrl]').val();
            }

            var data = {
                email: this.$parent.find('[data-mz-login-email]').val(),
                password: this.$parent.find('[data-mz-login-password]').val()
            };

            if (token && typeof token === 'string') {
                data.token = token;
            } else if (window.captchaToken) {
                data.token = window.captchaToken;
            }

            api.action('customer', 'loginStorefront', data).then(
                this.handleLoginResponse.bind(this, returnUrl), 
                this.displayApiMessage
            );
        },
        handleLoginResponse: function (returnUrl, response) {
            this.setLoading(false);
            
            // Check if 2FA is required
            if (response && response.requires2FA) {
                // Close current popover
                this.$el.popover('destroy');
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
                
                // Show 2FA challenge
                var twoFactorPopover = new TwoFactorChallengePopover();
                twoFactorPopover.init(this.$el[0]);
                twoFactorPopover.show2FAChallenge(
                    response.sessionId, 
                    response.email || this.$parent.find('[data-mz-login-email]').val(), 
                    returnUrl
                );
            } else {
                // Standard login completion
                this.handleLoginComplete(returnUrl);
            }
        },
        anonymousorder: function() {
            var email = "";
            var billingZipCode = "";
            var billingPhoneNumber = "";

            switch (this.$parent.find('[data-mz-verify-with]').val()) {
                case "zipCode":
                    {
                        billingZipCode = this.$parent.find('[data-mz-verification]').val();
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }
                case "phoneNumber":
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = this.$parent.find('[data-mz-verification]').val();
                        break;
                    }
                case "email":
                    {
                        billingZipCode = null;
                        email = this.$parent.find('[data-mz-verification]').val();
                        billingPhoneNumber = null;
                        break;
                    }
                default:
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }

            }

            this.setLoading(true);
            // the new handle message needs to take the redirect.
            api.action('customer', 'orderStatusLogin', {
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            }).then(function () { window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') +  "/my-anonymous-account?returnUrl="+(HyprLiveContext.locals.siteContext.siteSubdirectory||'')+"/myaccount"; }, _.bind(this.retrieveErrorLabel, this));
        },
        retrievePassword: function () {
            this.setLoading(true);
            api.action('customer', 'resetPasswordStorefront', {
                EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
            }).then(_.bind(this.displayResetPasswordMessage,this), this.displayApiMessage);
        },
        handleLoginComplete: function (returnUrl) {
            if ( returnUrl ){
                window.location.href= returnUrl;
            }else{
                window.location.reload();
            }        },
        switchToOTPLogin: function (e) {
            if (e) e.preventDefault();
            // Destroy current popover
            this.$el.popover('destroy');
            this.$el.off('click', returnFalse);
            this.bindListeners(false);
            $docBody.off('click', this.dismisser);
            
            // Create OTP login popover
            var otpPopover = new OTPLoginPopover();
            otpPopover.init(this.$el[0]);
            otpPopover.createPopover();
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();
    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { this.signup(); }
        },
        validate: function (payload) {
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            if (!payload.agreeToGDPR) return this.displayMessage(Hypr.getLabel('didNotAgreeToGDPR')), false;
            return true;
        },
        signup: function () {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
                agreeToGDPR = this.$parent.find('[data-mz-signup-agreeToGDPR]').prop('checked'),
                payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: this.$parent.find('[data-mz-signup-password]').val(),
                    agreeToGDPR: agreeToGDPR
                };
            if (this.validate(payload)) {
                delete payload.agreeToGDPR;
                //var user = api.createSync('user', payload);
                this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if (self.redirectTemplate) {
                        window.location.pathname = self.redirectTemplate;
                    }
                    else {
                        window.location.reload();
                    }
                }, self.displayApiMessage);
            }
        }
    });

    // Two-Factor Authentication Challenge Popover
    var TwoFactorChallengePopover = function() {
        DismissablePopover.apply(this, arguments);
        this.verify2FA = _.debounce(this.verify2FA, 150);
        this.resend2FA = _.debounce(this.resend2FA, 300);
        this.attemptCount = 0;
        this.maxAttempts = 3;
        this.canResend = true;
        this.resendCooldown = 60; // seconds
    };
    TwoFactorChallengePopover.prototype = new DismissablePopover();
    $.extend(TwoFactorChallengePopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleCodeInput', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'verify2FA', 'resend2FA', 'onPopoverShow', 'updateResendTimer'],
        template: Hypr.getTemplate('modules/common/2fa-challenge').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="verify-2fa"]', this.verify2FA);
            this.$parent[onOrOff]('click', '[data-mz-action="resend-2fa"]', this.resend2FA);
            this.$parent[onOrOff]('keypress keyup', '.mz-2fa-digit', this.handleCodeInput);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            // Focus first digit input
            this.$parent.find('.mz-2fa-digit').first().focus();
            this.startResendTimer();
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                this.verify2FA();
                return false;
            }
        },
        handleCodeInput: function (e) {
            var $input = $(e.currentTarget);
            var inputVal = $input.val();
            
            // Only allow numeric input
            if (e.type === 'keypress' && (e.which < 48 || e.which > 57) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
                return false;
            }
            
            // Auto-advance to next field
            if (e.type === 'keyup' && inputVal.length === 1 && e.which !== 8 && e.which !== 46) {
                var $nextInput = $input.next('.mz-2fa-digit');
                if ($nextInput.length) {
                    $nextInput.focus();
                } else {
                    // Auto-submit when all digits are filled
                    if (this.getCodeValue().length === 6) {
                        this.verify2FA();
                    }
                }
            }
            
            // Handle backspace - move to previous field
            if (e.type === 'keyup' && e.which === 8 && inputVal.length === 0) {
                var $prevInput = $input.prev('.mz-2fa-digit');
                if ($prevInput.length) {
                    $prevInput.focus();
                }
            }
        },
        getCodeValue: function () {
            var code = '';
            this.$parent.find('.mz-2fa-digit').each(function () {
                code += $(this).val();
            });
            return code;
        },
        clearCode: function () {
            this.$parent.find('.mz-2fa-digit').val('').first().focus();
        },
        verify2FA: function () {
            var code = this.getCodeValue();
            
            if (code.length !== 6) {
                this.displayMessage(Hypr.getLabel('2fa_code_incomplete'));
                return;
            }
            
            if (this.attemptCount >= this.maxAttempts) {
                this.displayMessage(Hypr.getLabel('2fa_max_attempts_reached'));
                return;
            }
            
            this.setLoading(true);
            this.attemptCount++;
            
            var data = {
                code: code,
                sessionId: this.sessionId || '',
                email: this.userEmail || ''
            };
            
            // Call 2FA verification API
            api.action('customer', 'verify2FA', data).then(
                this.handle2FASuccess.bind(this),
                this.handle2FAError.bind(this)
            );
        },
        handle2FASuccess: function (response) {
            this.setLoading(false);
            // Redirect to return URL or reload page
            var returnUrl = this.returnUrl || window.location.href;
            if (returnUrl) {
                window.location.href = returnUrl;
            } else {
                window.location.reload();
            }
        },
        handle2FAError: function (xhr) {
            this.setLoading(false);
            this.clearCode();
            
            var remainingAttempts = this.maxAttempts - this.attemptCount;
            if (remainingAttempts > 0) {
                var message = Hypr.getLabel('2fa_code_invalid_attempts').replace('{0}', remainingAttempts);
                this.displayMessage(message);
            } else {
                this.displayMessage(Hypr.getLabel('2fa_max_attempts_reached'));
                this.$parent.find('[data-mz-action="verify-2fa"]').prop('disabled', true);
            }
        },
        resend2FA: function () {
            if (!this.canResend) return;
            
            this.setLoading(true);
            this.canResend = false;
            
            var data = {
                sessionId: this.sessionId || '',
                email: this.userEmail || ''
            };
            
            api.action('customer', 'resend2FA', data).then(
                this.handleResendSuccess.bind(this),
                this.handleResendError.bind(this)
            );
        },
        handleResendSuccess: function () {
            this.setLoading(false);
            this.displayMessage(Hypr.getLabel('2fa_code_resent'));
            this.clearCode();
            this.startResendTimer();
        },
        handleResendError: function (xhr) {
            this.setLoading(false);
            this.displayApiMessage(xhr);
            this.canResend = true;
        },
        startResendTimer: function () {
            var self = this;
            var timeLeft = this.resendCooldown;
            var $resendBtn = this.$parent.find('[data-mz-action="resend-2fa"]');
            
            $resendBtn.prop('disabled', true);
            
            var timer = setInterval(function () {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    self.canResend = true;
                    $resendBtn.prop('disabled', false).text(Hypr.getLabel('resend_code'));
                } else {
                    $resendBtn.text(Hypr.getLabel('resend_code_timer').replace('{0}', timeLeft));
                    timeLeft--;
                }
            }, 1000);
        },
        show2FAChallenge: function (sessionId, userEmail, returnUrl) {
            this.sessionId = sessionId;
            this.userEmail = userEmail;
            this.returnUrl = returnUrl;
            this.attemptCount = 0;
            this.canResend = true;
            
            // Create and show popover
            this.createPopover();
        }
    });

    // OTP Login Popover
    var OTPLoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.sendOTP = _.debounce(this.sendOTP, 150);
        this.verifyOTP = _.debounce(this.verifyOTP, 150);
        this.resendOTP = _.debounce(this.resendOTP, 300);
        this.attemptCount = 0;
        this.maxAttempts = 3;
        this.canResend = true;
        this.resendCooldown = 60; // seconds
        this.otpSent = false;
    };
    OTPLoginPopover.prototype = new DismissablePopover();
    $.extend(OTPLoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleCodeInput', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'sendOTP', 'verifyOTP', 'resendOTP', 'onPopoverShow', 'toggleToPasswordLogin'],
        template: Hypr.getTemplate('modules/common/otp-login').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="send-otp"]', this.sendOTP);
            this.$parent[onOrOff]('click', '[data-mz-action="verify-otp"]', this.verifyOTP);
            this.$parent[onOrOff]('click', '[data-mz-action="resend-otp"]', this.resendOTP);
            this.$parent[onOrOff]('click', '[data-mz-action="back-to-password"]', this.toggleToPasswordLogin);
            this.$parent[onOrOff]('keypress keyup', '.mz-otp-digit', this.handleCodeInput);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            // Focus email input initially
            this.$parent.find('[data-mz-otp-email]').focus();
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                if ($parentForm.data('mz-role') === 'otp-email-form') {
                    this.sendOTP();
                } else if ($parentForm.data('mz-role') === 'otp-verify-form') {
                    this.verifyOTP();
                }
                return false;
            }
        },
        handleCodeInput: function (e) {
            var $input = $(e.currentTarget);
            var inputVal = $input.val();
            
            // Only allow numeric input
            if (e.type === 'keypress' && (e.which < 48 || e.which > 57) && e.which !== 8 && e.which !== 46) {
                e.preventDefault();
                return false;
            }
            
            // Auto-advance to next field
            if (e.type === 'keyup' && inputVal.length === 1 && e.which !== 8 && e.which !== 46) {
                var $nextInput = $input.next('.mz-otp-digit');
                if ($nextInput.length) {
                    $nextInput.focus();
                } else {
                    // Auto-submit when all digits are filled
                    if (this.getOTPValue().length === 6) {
                        this.verifyOTP();
                    }
                }
            }
            
            // Handle backspace - move to previous field
            if (e.type === 'keyup' && e.which === 8 && inputVal.length === 0) {
                var $prevInput = $input.prev('.mz-otp-digit');
                if ($prevInput.length) {
                    $prevInput.focus();
                }
            }
        },
        getOTPValue: function () {
            var code = '';
            this.$parent.find('.mz-otp-digit').each(function () {
                code += $(this).val();
            });
            return code;
        },
        clearOTP: function () {
            this.$parent.find('.mz-otp-digit').val('').first().focus();
        },
        sendOTP: function () {
            var email = this.$parent.find('[data-mz-otp-email]').val();
            
            if (!email) {
                this.displayMessage(Hypr.getLabel('emailMissing'));
                return;
            }
            
            // Basic email validation
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.displayMessage(Hypr.getLabel('emailInvalid'));
                return;
            }
            
            this.setLoading(true);
            this.userEmail = email;
            
            var data = { email: email };
            
            api.action('customer', 'sendOTP', data).then(
                this.handleOTPSendSuccess.bind(this),
                this.handleOTPSendError.bind(this)
            );
        },
        handleOTPSendSuccess: function (response) {
            this.setLoading(false);
            this.otpSent = true;
            this.sessionId = response.sessionId;
            
            // Show OTP verification form
            this.$parent.find('[data-mz-role="otp-email-form"]').hide();
            this.$parent.find('[data-mz-role="otp-verify-form"]').show();
            this.$parent.find('.mz-otp-digit').first().focus();
            
            this.displayMessage(Hypr.getLabel('otp_sent_to_email'));
            this.startResendTimer();
        },
        handleOTPSendError: function (xhr) {
            this.setLoading(false);
            this.displayApiMessage(xhr);
        },
        verifyOTP: function () {
            var code = this.getOTPValue();
            
            if (code.length !== 6) {
                this.displayMessage(Hypr.getLabel('otp_code_incomplete'));
                return;
            }
            
            if (this.attemptCount >= this.maxAttempts) {
                this.displayMessage(Hypr.getLabel('otp_max_attempts_reached'));
                return;
            }
            
            this.setLoading(true);
            this.attemptCount++;
              var returnUrl = "";
            var returnUrlParam = getUrlParameter('returnUrl');
            if (returnUrlParam && !this.$parent.find('input[name=returnUrl]').val()) {
                returnUrl = returnUrlParam;
            } else {
                returnUrl = this.$parent.find('input[name=returnUrl]').val();
            }
            
            var data = {
                code: code,
                sessionId: this.sessionId || '',
                email: this.userEmail || ''
            };
            
            api.action('customer', 'verifyOTP', data).then(
                this.handleOTPVerifySuccess.bind(this, returnUrl),
                this.handleOTPVerifyError.bind(this)
            );
        },
        handleOTPVerifySuccess: function (returnUrl, response) {
            this.setLoading(false);
            // Redirect to return URL or reload page
            if (returnUrl) {
                window.location.href = returnUrl;
            } else {
                window.location.reload();
            }
        },
        handleOTPVerifyError: function (xhr) {
            this.setLoading(false);
            this.clearOTP();
            
            var remainingAttempts = this.maxAttempts - this.attemptCount;
            if (remainingAttempts > 0) {
                var message = Hypr.getLabel('otp_code_invalid_attempts').replace('{0}', remainingAttempts);
                this.displayMessage(message);
            } else {
                this.displayMessage(Hypr.getLabel('otp_max_attempts_reached'));
                this.$parent.find('[data-mz-action="verify-otp"]').prop('disabled', true);
            }
        },
        resendOTP: function () {
            if (!this.canResend) return;
            
            this.setLoading(true);
            this.canResend = false;
            
            var data = {
                email: this.userEmail || ''
            };
            
            api.action('customer', 'resendOTP', data).then(
                this.handleOTPResendSuccess.bind(this),
                this.handleOTPResendError.bind(this)
            );
        },
        handleOTPResendSuccess: function (response) {
            this.setLoading(false);
            this.sessionId = response.sessionId;
            this.displayMessage(Hypr.getLabel('otp_code_resent'));
            this.clearOTP();
            this.startResendTimer();
        },
        handleOTPResendError: function (xhr) {
            this.setLoading(false);
            this.displayApiMessage(xhr);
            this.canResend = true;
        },
        startResendTimer: function () {
            var self = this;
            var timeLeft = this.resendCooldown;
            var $resendBtn = this.$parent.find('[data-mz-action="resend-otp"]');
            
            $resendBtn.prop('disabled', true);
            
            var timer = setInterval(function () {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    self.canResend = true;
                    $resendBtn.prop('disabled', false).text(Hypr.getLabel('resend_code'));
                } else {
                    $resendBtn.text(Hypr.getLabel('resend_code_timer').replace('{0}', timeLeft));
                    timeLeft--;
                }
            }, 1000);
        },
        toggleToPasswordLogin: function (e) {
            if (e) e.preventDefault();
            // Destroy current popover and show regular login
            this.$el.popover('destroy');
            this.$el.off('click', returnFalse);
            this.bindListeners(false);
            $docBody.off('click', this.dismisser);
            
            // Create regular login popover
            var loginPopover = new LoginPopover();
            loginPopover.init(this.$el[0]);
            loginPopover.createPopover();
        }
    });

    $(document).ready(function() {
        $docBody = $(document.body);        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="otp-login"]').each(function() {
            var popover = new OTPLoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signup"]').each(function() {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="continueAsGuest"]').on('click', function(e) {
            e.preventDefault();
            var returnURL = returnUrl();
            if(returnURL .indexOf('checkout') === -1) {
                returnURL = '';
            }

            //saveUserId=true Will logut the current user while persisting the state of the current shopping cart
            $.ajax({
                    method: 'GET',
                    url: '../../logout?saveUserId=true&returnUrl=' + returnURL,
                    complete: function(data) {
                        location.href = require.mozuData('pagecontext').secureHost + '/' + returnURL;
                    }
            });

        });
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signuppage-submit"]').each(function(){
            var signupPage = new SignupPopover();
            signupPage.formSelector = 'form[name="mz-signupform"]';
            signupPage.pageType = 'signup';
            signupPage.redirectTemplate = 'myaccount';
            signupPage.init(this);
        });
        $('[data-mz-action="loginpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'login';
            loginPage.init(this);
        });   
        $('[data-mz-action="anonymousorder-submit"]').each(function () {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-anonymousorder"]';
            loginPage.pageType = 'anonymousorder';
            loginPage.init(this);
        });
        $('[data-mz-action="forgotpasswordpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-forgotpasswordform"]';
            loginPage.pageType = 'retrievePassword';
            loginPage.init(this);
        });

        $('[data-mz-action="quickOrder"]').on('click', function(e){
              // The Quick Order link takes us to the my account page and opens
              // the appropriate pane.
              // If we're already on the my account page we ensure the page reloads.
              var isMyAccount = window.location.href.indexOf("myaccount") > 0;
              if (isMyAccount){
                  //window.location.reload(false);
                  window.location.assign((HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/myaccount#QuickOrder");
                  window.location.reload(false);
              }
        });

        $('[data-mz-action="logout"]').each(function(){
            var el = $(this);

            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {

                 el.on('click', function(e) {
                    e.preventDefault();
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload();}
                    });
                });
            }

        });

        $('[data-mz-action="recaptcha-submit"]').each(function() {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'loginRecaptcha';
            loginPage.init(this);

            var recaptchaContainer = HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'recaptcha-container-global' : 'recaptcha-container';

            if (!window.renderedRecaptcha) {
                grecaptcha.render(
                    recaptchaContainer,
                    {
                        size: HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'invisible' : HyprLiveContext.locals.themeSettings.recaptchaSize,
                        badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                        theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                        sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                        callback: function(result) {
                            window.captchaToken = result;
                            loginPage.login(result);
                        }
                    }
                );
            }

            window.renderedRecaptcha = true;
        });
    });
});
