/* globals grecaptcha */

/**
 * Adds a login popover to all login links on a page.
 */
define(['modules/jquery-mozu', 'modules/api', 'hyprlive', 'modules/backbone-mozu', 'underscore', 'hyprlivecontext', 'vendor/jquery-placeholder/jquery.placeholder', 'shim!vendor/bootstrap/js/popover[modules/jquery-mozu=jQuery,shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]]'],
function ($, api, Hypr, Backbone, _, HyprLiveContext) {   
    
    var usePopovers = function() {
        return (typeof Modernizr !== 'undefined') && !Modernizr.mq('(max-width: 480px)');
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {
        return false;
    },
    returnUrl = function() {
        var returnURL = $('input[name=returnUrl]').val();
        if(!returnURL) {
            returnURL = '/';
        }
        return returnURL;
    },
    getQueryParam = function(name) {
        // Cross-browser compatible query parameter extraction
        var urlParams = window.location.search;
        if (!urlParams) {
            return null;
        }
        
        // Remove the leading '?' if present
        if (urlParams.charAt(0) === '?') {
            urlParams = urlParams.substring(1);
        }
        
        var params = urlParams.split('&');
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split('=');
            if (param[0] === name) {
                return param[1] ? decodeURIComponent(param[1]) : '';
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
            // var self = this;
            // if (usePopovers()) {
            //     e.preventDefault();
            //     // If the parent element's not positioned at least relative,
            //     // the popover won't move with a window resize
            //     //var pos = $parent.css('position');
            //     //if (!pos || pos === "static") $parent.css('position', 'relative');
            //     this.$el.popover({
            //         //placement: "auto right",
            //         animation: true,
            //         html: true,
            //         trigger: 'manual',
            //         content: this.template,
            //         container: 'body'
            //     }).on('shown.bs.popover', this.onPopoverShow)
            //     .popover('show');

            // }
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
        displayMessage: function (msg, type) {
            if(!type) {
                type = 'error';
            }
            this.setLoading(false);
            var messageClass = type === 'error' ? 'mz-validationmessage' : 'mz-validationmessage-success';
            
            // During 2FA flow, target the message container in the 2FA UI section
            if (this.is2FAInProgress) {
                // First try to find a message container within the 2FA UI
                var $twoFAMessageContainer = this.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                if ($twoFAMessageContainer.length > 0) {
                    // Message container found in the 2FA UI, use it
                    $twoFAMessageContainer.html("<span class='" + messageClass + "'>" + msg + '</span>');
                    
                    // Check if the message container is visible
                    if (!$twoFAMessageContainer.is(':visible')) {
                        // Make sure the containing row is visible
                        $twoFAMessageContainer.closest('.mz-twofa-message-row').show();
                    }
                    
                    return;
                }
            }
            
            // Default message container
            this.$parent.find('[data-mz-role="popover-message"]').html("<span class='" + messageClass + "'>" + msg + '</span>');
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
            
            // Check if we're in OTP mode using multiple indicators
            var $requestBtn = this.$parent.find('[data-mz-action="request-otp-code"]');
            var $passwordRow = this.$parent.find('input[data-mz-login-password]').closest('.mz-l-formfieldgroup-row');
            var isOtpInProgress = this.$parent.data('mz-is-otp-in-progress');
            
            // Check if we're in 2FA mode
            var $twofaInput = this.$parent.find('[data-mz-twofa-code]');
            var $twofaElements = this.$parent.find('.mz-twofa-title-row, .mz-twofa-input-row, .mz-twofa-buttons-row');
            var is2FAInProgress = this.is2FAInProgress || this.$parent.data('mz-is-2fa-in-progress');
            
            
            // If 2FA is in progress, prevent form submission
            // Only block if 2FA elements are visible (active), not just present in DOM
            if (is2FAInProgress || ($twofaInput.length > 0 && $twofaElements.is(':visible'))) {
                return false;
            }
            
            // If OTP is in progress (flag set), prevent login
            if (isOtpInProgress) {
                return false;
            }
            
            // If OTP button exists and password field is hidden, we're in OTP mode
            if ($requestBtn.length > 0 && $passwordRow.is(':hidden')) {
                return false;
            }
            
            // If OTP button is visible, we're also in OTP mode
            if ($requestBtn.length > 0 && $requestBtn.is(':visible')) {
                return false;
            }
            
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();    
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: (function() {
            try {
                var template = Hypr.getTemplate('modules/common/login-popover').render();
                return template;
            } catch (e) {
                return '<div class="mz-popover-error">' + Hypr.getLabel('templateLoadingFailed') + '</div>';
            }
        })(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="recaptchasubmitlogin"]', this.loginRecaptcha.bind(this));
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
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
                var $target = $(e.currentTarget);
                
                // Prevent Enter in 2FA/OTP code input fields (auto-verification handles these)
                if ($target.is('[data-mz-twofa-code]') || $target.is('[data-mz-otp-code]')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                
                // For OTP request code screen: Enter on email input triggers request code
                if ($target.is('[data-mz-login-email]')) {
                    var $container = $target.closest('[data-mz-role], .mz-loginform-page');
                    var $requestBtn = $container.find('[data-mz-action="request-otp-code"]');
                    
                    // Only proceed with OTP actions if we're in a login form, not an order status form
                    if ($container.hasClass('mz-anonymousorder-form')) {
                        return; // Skip OTP logic for order status forms
                    }
                    
                    // Check if we're in OTP mode (request code button exists and is visible)
                    if ($requestBtn.length && $requestBtn.is(':visible')) {
                        e.preventDefault();
                        e.stopPropagation();
                        $requestBtn.trigger('click');
                        return false;
                    }
                    
                    // Also check if OTP mode is active by checking if password field is hidden
                    var $passwordField = $container.find('input[data-mz-login-password]');
                    var $passwordRow = $passwordField.closest('.mz-l-formfieldgroup-row');
                    
                    if ($passwordRow.length && $passwordRow.is(':hidden') && $requestBtn.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        $requestBtn.trigger('click');
                        return false;
                    }
                }
                
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                
                // Only proceed with login if we're not in an email field during OTP mode
                if (!$target.is('[data-mz-login-email]')) {
                    switch ($parentForm.data('mz-role')) {
                        case "login-form":
                            this.login();
                            break;
                        case "forgotpassword-form":
                            this.retrievePassword();
                            break;
                    }
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
        },          
        login: function (token) {
            this.setLoading(true);

            //NGCOM-623
            //If a returnUrl has been specified in the url query and there
            //is no returnUrl value provided by the server,
            //we'll use the one specified in the url query. If a returnURl has been
            //provided by the server, it will live in an invisible input in the
            //login links box.  
                      
            var returnUrl = "";
            var returnUrlParam = getQueryParam('returnUrl');
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
            
            // Add 2FA code if we're in 2FA mode
            if (this.is2FAInProgress) {
                data.twoFactorCode = this.$parent.find('[data-mz-twofa-code]').val();
            }

            if(require.mozuData('user').isAuthenticated) {
                this.handleLoginComplete.bind(this, returnUrl);
            }

            var self = this;
            api.action('customer', 'loginStorefront', data).then(
                this.handleLoginComplete.bind(this, returnUrl), 
                function(error) {
                    // Check if this is a 401 error requiring 2FA
                    // Handle both message text and requires2FA flag
                    var requiresTwoFA = false;
                    
                    if (error && error.requires2FA === true) {
                        requiresTwoFA = true;
                    } 

                    if (requiresTwoFA) {
                        // Start 2FA challenge for this specific error
                        self.start2FAChallenge();
                    } else {
                        // Handle all other errors normally
                        self.displayApiMessage(error);
                    }
                }
            );

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

            }            this.setLoading(true);
            // the new handle message needs to take the redirect.
            var apiData = {
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            };            // Add 2FA code if we're in 2FA mode
            if (this.is2FAInProgress) {
                apiData.twoFactorCode = this.$parent.find('[data-mz-twofa-code]').val();
            }

            api.action('customer', 'orderStatusLogin', apiData).then(function () { window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') +  "/my-anonymous-account?returnUrl="+(HyprLiveContext.locals.siteContext.siteSubdirectory||'')+"/myaccount"; }, _.bind(this.retrieveErrorLabel, this));
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
            }        
        },
        start2FAChallenge: function() {
            // Only allow 2FA on login forms, not order status forms
            if (this.$parent.hasClass('mz-anonymousorder-form')) {
                return; // Skip 2FA for order status forms
            }
            
            this.clearMessages();
            var email = this.$parent.find('[data-mz-login-email]').val();
            var password = this.$parent.find('[data-mz-login-password]').val();
            
            if (!email || !password) {
                this.displayMessage('Please enter both email and password.');
                return;
            }
            
            // Show 2FA challenge with email
            this.show2FAChallenge(email);
            
            // Set flag to indicate 2FA is in progress
            this.is2FAInProgress = true;
        },       
         show2FAChallenge: function(email) {
            var self = this;
            
            // Only allow 2FA on login forms, not order status forms
            if (this.$parent.hasClass('mz-anonymousorder-form')) {
                return; // Skip 2FA for order status forms
            }
            
            // Set 2FA flag and prevent form submission
            this.is2FAInProgress = true;
            this.$parent.on('submit.twofa', function(e) {
                e.preventDefault();
                return false;
            });
            
            var $emailRow = this.$parent.find('input[data-mz-login-email]').closest('.mz-l-formfieldgroup-row');
            var $passwordRow = this.$parent.find('input[data-mz-login-password]').closest('.mz-l-formfieldgroup-row');
            var $recaptchaRow = this.$parent.find('#recaptcha-container').closest('.mz-l-formfieldgroup-row');
            var $linksRow = this.$parent.find('.mz-forgot').closest('.mz-l-formfieldgroup-row');
            var $loginButtonRow = this.$parent.find('[data-mz-action="loginpage-submit"], [data-mz-action="recaptcha-submit"]').closest('.mz-l-formfieldgroup-row');
            
            $emailRow.hide();
            $passwordRow.hide();
            $recaptchaRow.hide();
            $linksRow.hide();
            $loginButtonRow.hide();

            // Show 2FA challenge UI
            var twoFAHtml = '<div class="mz-l-formfieldgroup-row mz-twofa-title-row">' +
                           '<h3>' + Hypr.getLabel('loginVerificationRequired') + '</h3>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-input-row">' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<label for="mz-twofa-code">' + Hypr.getLabel('verificationCode') + '</label>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<input type="text" id="mz-twofa-code" data-mz-twofa-code maxlength="6" placeholder="' + Hypr.getLabel('enter6DigitCode') + '" autocomplete="one-time-code" pattern="[0-9]{6}" required>' +
                           '</div>' +
                           '</div>' +
                           '<section data-mz-role="popover-message" class="mz-popover-message"></section>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-buttons-row">' +
                           '<div class="mz-l-formfieldgroup-cell"></div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<a href="#" class="mz-resend-twofa" data-mz-action="resend-twofa-code">' + Hypr.getLabel('resendCode') + '</a>' +
                           '</div>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-back-row">' +
                           '<div class="mz-l-formfieldgroup-cell"></div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<a href="#" class="mz-back-to-login" data-mz-action="backto-login">' + Hypr.getLabel('backToLogin') + '</a>' +
                           '</div>' +
                           '</div>';
            
            // Insert the 2FA UI after the form group
            this.$parent.find('.mz-l-formfieldgroup').append(twoFAHtml);
            
            // Focus on the 2FA input
            $('#mz-twofa-code').focus();
            
            // Simulate sending 2FA code
            this.send2FACode(email);
            
            // Bind event handlers for 2FA
            this.bind2FAHandlers();
        },        
          send2FACode: function(email) {
            var self = this;
            
            // Generate 2FA OTP using API
            api.action('customer', 'generateAndSend2faOtp', {
                email: email
            }).then(function(response) {
                // Store session data
                self.$parent.data('twoFA-email', email);
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                // Show success message
                self.displayMessage(Hypr.getLabel('twoFACodeSent', email), 'success');
                
            })["catch"](function(error) {
                self.displayMessage(error.message, 'error');
            });
        },
        bind2FAHandlers: function() {
            var self = this;
            
            // Remove any existing handlers to prevent duplicates
            this.$parent.off('click', '[data-mz-action="verify-twofa"]');
            this.$parent.off('click', '[data-mz-action="resend-twofa-code"]');
            this.$parent.off('click', '[data-mz-action="backto-login"]');
            this.$parent.off('input', '[data-mz-twofa-code]');
            
            // Verify code button
            this.$parent.on('click', '[data-mz-action="verify-twofa"]', function(e) {
                e.preventDefault();
                var code = self.$parent.find('[data-mz-twofa-code]').val();
                self.verify2FACode(code);
            });
            
            // Resend code
            this.$parent.on('click', '[data-mz-action="resend-twofa-code"]', function(e) {
                e.preventDefault();
                var email = self.$parent.data('twoFA-email');
                self.resend2FACode(email);
            });
            
            // Back to login
            this.$parent.on('click', '[data-mz-action="backto-login"]', function(e) {
                e.preventDefault();
                self.cancel2FAChallenge();
            });
            
            // Auto-verify when 6 digits are entered
            this.$parent.on('input', '[data-mz-twofa-code]', function() {
                var codeValue = $(this).val();
                if (codeValue.length === 6) {
                    self.verify2FACode(codeValue);
                }
            });
        },        
        verify2FACode: function(enteredCode) {
            var email = this.$parent.data('twoFA-email');
            var sessionId = this.$parent.data('twoFA-sessionId');
            
            // Show loading state
            var $input = this.$parent.find('[data-mz-twofa-code]');
            $input.prop('disabled', true);

            var returnUrl = "";
            var returnUrlParam = getQueryParam('returnUrl');
            if (returnUrlParam && !this.$parent.find('input[name=returnUrl]').val()){
              returnUrl = returnUrlParam;
            } else {
              returnUrl = this.$parent.find('input[name=returnUrl]').val();
            }

            var self = this;
            
            // Validate 2FA using API
            api.action('customer', 'validate2faAndCreateAuthTicket', {
                OtpCode: enteredCode            
            }).then(function(response) {
                self.displayMessage(Hypr.getLabel('twoFACodeVerified'), 'success');
                
                // Clear 2FA flag and remove form submission prevention
                self.is2FAInProgress = false;
                self.$parent.off('submit.twofa');

                self.handleLoginComplete.bind(self, returnUrl)();
                
            })["catch"](function(error) {
                // Handle error
                $input.prop('disabled', false);
                
                var errorMessage = "";
                var shouldReset2FA = false;
                
                // Check for specific error conditions based on API response
                if (error && error.result && error.result.message) {
                    var apiMessage = error.result.message;
                    
                    if (apiMessage.toLowerCase().includes('invalid otp')) {
                        errorMessage = Hypr.getLabel('twoFACodeIncorrect');
                    } else if (apiMessage.toLowerCase().includes('retry count exceeded')) {
                        errorMessage = Hypr.getLabel('twoFARetryExceeded');
                        shouldReset2FA = true;
                    } else if (apiMessage.toLowerCase().includes('generate a new otp.')) {
                        errorMessage = Hypr.getLabel('twoFAExpired');
                        shouldReset2FA = true;
                    } else {
                        errorMessage = apiMessage;
                    }
                } 
                
                self.displayMessage(errorMessage, 'error');
                
                if (shouldReset2FA) {
                    // Simply update the resend button text to "Request New Code"
                    var $resendLink = self.$parent.find('[data-mz-action="resend-twofa-code"]');
                    if ($resendLink.length > 0) {
                        $resendLink.text(Hypr.getLabel('requestNewCode'));
                    }
                    
                    // Clear the input field and focus
                    self.$parent.find('[data-mz-twofa-code]').val('').focus();
                } else {
                    // Clear the input field and allow retry
                    self.$parent.find('[data-mz-twofa-code]').val('').focus();
                }
            });
        },        
        resend2FACode: function(email) {
            var self = this;
            var $resendLink = this.$parent.find('[data-mz-action="resend-twofa-code"]');
            
            $resendLink.text(Hypr.getLabel('sending')).addClass('is-loading');
              // Generate new 2FA OTP using API
            api.action('customer', 'generateAndSend2faOtp', {
                email: email
            }).then(function(response) {
                // Update session data
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                self.displayMessage(Hypr.getLabel('twoFACodeSent', email), 'success');
                $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
                
                // Clear the input field
                self.$parent.find('[data-mz-twofa-code]').val('').focus();
                
            })["catch"](function(error) {
                // Handle error
                var errorMessage = Hypr.getLabel('twoFASendFailed');
                
                // Check for specific error conditions
                if (error && error.message) {
                    if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        errorMessage = Hypr.getLabel('twoFARateLimited');
                    }
                }
                
                // Check for 302 redirect or authentication issues
                if (error.status === 302 || error.statusCode === 302 || 
                    (error.message && error.message.toLowerCase().includes('redirect')) ||
                    (error.message && error.message.toLowerCase().includes('unauthorized')) ||
                    (error.message && error.message.toLowerCase().includes('authentication'))) {
                    // Session expired or user not authenticated
                    errorMessage = "Your session has expired. Please refresh the page and try logging in again.";
                    // Optionally, we could redirect to login page
                    setTimeout(function() {
                        window.location.reload();
                    }, 3000);
                }
                
                self.displayMessage(errorMessage, 'error');
                $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
            });
        },
        cancel2FAChallenge: function() {
            this.is2FAInProgress = false;
            
            // Remove form submission prevention
            this.$parent.off('submit.twofa');
            
            // Remove 2FA UI elements
            this.$parent.find('.mz-twofa-title-row, .mz-twofa-input-row, .mz-twofa-buttons-row, .mz-twofa-back-row, .mz-twofa-request-row').remove();
            
            // Show regular login form elements
            var $emailRow = this.$parent.find('input[data-mz-login-email]').closest('.mz-l-formfieldgroup-row');
            var $passwordRow = this.$parent.find('input[data-mz-login-password]').closest('.mz-l-formfieldgroup-row');
            var $recaptchaRow = this.$parent.find('#recaptcha-container').closest('.mz-l-formfieldgroup-row');
            var $linksRow = this.$parent.find('.mz-forgot').closest('.mz-l-formfieldgroup-row');
            var $loginButtonRow = this.$parent.find('[data-mz-action="loginpage-submit"], [data-mz-action="recaptcha-submit"]').closest('.mz-l-formfieldgroup-row');
            
            $emailRow.show();
            $passwordRow.show();
            $recaptchaRow.show();
            $linksRow.show();
            $loginButtonRow.show();              // Clear any 2FA data
            this.$parent.removeData('twoFA-email twoFA-sessionId verified2FACode orderLoginData');
            
            // Clear any messages
            this.clearMessages();
        },        
        complete2FAChallenge: function() {
            
            // Reset 2FA UI but keep the flag true so the corresponding function knows we're completing 2FA
            this.cancel2FAChallenge();
            this.is2FAInProgress = true;
            
            // Create a temporary hidden input with the 2FA code
            var twoFACode = this.$parent.data('verified2FACode');
            var $hiddenInput = $('<input type="hidden" data-mz-twofa-code value="' + twoFACode + '">');
            this.$parent.append($hiddenInput);
            
            // Get the original login values and proceed with login
            var email = this.$parent.find('[data-mz-login-email]').val();
            var password = this.$parent.find('[data-mz-login-password]').val();
            
            // Set the values back in case they were cleared
            this.$parent.find('[data-mz-login-email]').val(email);
            this.$parent.find('[data-mz-login-password]').val(password);
            
            this.login();
            
            // Clean up after login attempt
            $hiddenInput.remove();
            this.is2FAInProgress = false;
        },
        clearMessages: function() {
           this.$parent.find('[data-mz-role="popover-message"]').filter(':visible').each(function () {
                $(this).off().remove(); // or .empty() or .hide()
           });
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
    };
    SignupPopover.prototype = new DismissablePopover();    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow', 'login', 'startSignup2FAChallenge', 'showSignup2FAChallenge', 'cancelSignup2FAChallenge', 'bindSignup2FAHandlers', 'storeSignupData', 'sendSignup2FACode', 'verifySignup2FACode', 'completeSignupWith2FA', 'resendSignup2FACode'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { 
                var $target = $(e.currentTarget);
                
                // Prevent Enter in 2FA/OTP code input fields (auto-verification handles these)
                if ($target.is('[data-mz-twofa-code]') || $target.is('[data-mz-otp-code]')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                
                this.signup(); 
            }
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
                }, function(error) {
                    // Check if this is a 2FA required error (same as login flow)
                    var requiresTwoFA = false;
                    
                    if (error && error.requires2FA === true) {
                        requiresTwoFA = true;
                    } else if (error && error.message) {
                        var errorMsg = error.message.toLowerCase();
                        if (errorMsg.includes('two factor authentication is required') || 
                            errorMsg.includes('two factor authentication') || 
                            errorMsg.includes('2fa')) {
                            requiresTwoFA = true;
                        }
                    }
                    
                    if (requiresTwoFA) {
                        // Store signup data and start 2FA challenge
                        self.storeSignupData(payload);
                        self.startSignup2FAChallenge();
                    } else {
                        // Handle all other errors normally
                        self.displayApiMessage(error);
                    }
                });
            }
        },
        storeSignupData: function(payload) {
            // Store the signup payload for completion after 2FA
            this.$parent.data('signupPayload', payload);
            
            // Extract email for 2FA process (reuse existing 2FA email storage)
            var email = payload.account.emailAddress;
            this.$parent.data('twoFA-email', email);
        },
        handleLoginComplete: function (returnUrl) {
            // For signup, we just reload the page after successful 2FA
            // (Override the parent method which handles login redirects)
            if (returnUrl) {
                window.location.pathname = returnUrl;
            }
            else {
                window.location.reload();
            }
        },
        startSignup2FAChallenge: function() {
            // Only allow 2FA on signup forms
            if (this.$parent.hasClass('mz-anonymousorder-form')) {
                return; // Skip 2FA for order status forms
            }
            
            this.clearMessages();
            var email = this.$parent.data('twoFA-email');
            
            if (!email) {
                this.displayMessage('Please complete the signup form first.');
                return;
            }
            
            // Show 2FA challenge with email
            this.showSignup2FAChallenge(email);
            
            // Set flag to indicate 2FA is in progress
            this.is2FAInProgress = true;
        },
        showSignup2FAChallenge: function(email) {
            var self = this;
            
            // Only allow 2FA on signup forms
            if (this.$parent.hasClass('mz-anonymousorder-form')) {
                return; // Skip 2FA for order status forms
            }
            
            // Set 2FA flag and prevent form submission
            this.is2FAInProgress = true;
            this.$parent.on('submit.twofa', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Hide all signup form fields
            var $firstNameRow = this.$parent.find('input[data-mz-signup-firstname]').closest('.mz-l-formfieldgroup-row');
            var $lastNameRow = this.$parent.find('input[data-mz-signup-lastname]').closest('.mz-l-formfieldgroup-row');
            var $emailRow = this.$parent.find('input[data-mz-signup-emailaddress]').closest('.mz-l-formfieldgroup-row');
            var $passwordRow = this.$parent.find('input[data-mz-signup-password]').closest('.mz-l-formfieldgroup-row');
            var $confirmPasswordRow = this.$parent.find('input[data-mz-signup-confirmpassword]').closest('.mz-l-formfieldgroup-row');
            var $gdprRow = this.$parent.find('input[data-mz-signup-agreeToGDPR]').closest('.mz-l-formfieldgroup-row');
            var $signupButtonRow = this.$parent.find('[data-mz-action="signup"], [data-mz-action="signuppage-submit"]').closest('.mz-l-formfieldgroup-row');
            
            // Hide signup form elements
            $firstNameRow.hide();
            $lastNameRow.hide();
            $emailRow.hide();
            $passwordRow.hide();
            $confirmPasswordRow.hide();
            $gdprRow.hide();
            $signupButtonRow.hide();

            // Hide the default message container
            this.$parent.find('.mz-l-formfieldgroup-row:last').hide();

            // Check if 2FA message container exists
            var $messageRow = this.$parent.find('.mz-twofa-message-row');
            
            // If message container doesn't exist, create it dynamically
            if ($messageRow.length === 0) {
                var messageHtml = '<div class="mz-l-formfieldgroup-row mz-twofa-message-row">' +
                                  '<div class="mz-l-formfieldgroup-cell"></div>' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<section data-mz-role="popover-message" class="mz-popover-message"></section>' +
                                  '</div>' +
                                  '</div>';
                
                // Insert after input row
                this.$parent.find('.mz-twofa-input-row').after(messageHtml);
            }

            // Make sure message row is visible
            this.$parent.find('.mz-twofa-message-row').show();
            
            // Show 2FA challenge UI elements
            this.$parent.find('.mz-twofa-title-row, .mz-twofa-input-row, .mz-twofa-buttons-row, .mz-twofa-back-row').show();
            
            // Set 2FA flag (ensure this is set before sending the code)
            this.is2FAInProgress = true;
            
            // Focus on the 2FA input
            this.$parent.find('[data-mz-twofa-code]').focus();
            
            // Send 2FA code
            this.sendSignup2FACode(email);
            
            // Bind event handlers for 2FA
            this.bindSignup2FAHandlers();
        },
        cancelSignup2FAChallenge: function() {
            this.is2FAInProgress = false;
            
            // Remove form submission prevention
            this.$parent.off('submit.twofa');
            
            // Hide 2FA UI elements
            this.$parent.find('.mz-twofa-title-row, .mz-twofa-input-row, .mz-twofa-buttons-row, .mz-twofa-back-row, .mz-twofa-message-row').hide();
            
            // Show all signup form elements
            var $firstNameRow = this.$parent.find('input[data-mz-signup-firstname]').closest('.mz-l-formfieldgroup-row');
            var $lastNameRow = this.$parent.find('input[data-mz-signup-lastname]').closest('.mz-l-formfieldgroup-row');
            var $emailRow = this.$parent.find('input[data-mz-signup-emailaddress]').closest('.mz-l-formfieldgroup-row');
            var $passwordRow = this.$parent.find('input[data-mz-signup-password]').closest('.mz-l-formfieldgroup-row');
            var $confirmPasswordRow = this.$parent.find('input[data-mz-signup-confirmpassword]').closest('.mz-l-formfieldgroup-row');
            var $gdprRow = this.$parent.find('input[data-mz-signup-agreeToGDPR]').closest('.mz-l-formfieldgroup-row');
            var $signupButtonRow = this.$parent.find('[data-mz-action="signup"], [data-mz-action="signuppage-submit"]').closest('.mz-l-formfieldgroup-row');
            
            $firstNameRow.show();
            $lastNameRow.show();
            $emailRow.show();
            $passwordRow.show();
            $confirmPasswordRow.show();
            $gdprRow.show();
            $signupButtonRow.show();
            
            // Clear any 2FA data
            this.$parent.removeData('twoFA-email twoFA-sessionId verified2FACode signupPayload');
            
            // Show the default message container
            this.$parent.find('.mz-l-formfieldgroup-row:last').show();
            
            // Clear any messages
            this.clearMessages();
        },
        bindSignup2FAHandlers: function() {
            var self = this;
            
            // Remove any existing handlers to prevent duplicates
            this.$parent.off('click', '[data-mz-action="verify-twofa"]');
            this.$parent.off('click', '[data-mz-action="resend-twofa-code"]');
            this.$parent.off('click', '[data-mz-action="backto-signup"]');
            this.$parent.off('input', '[data-mz-twofa-code]');
            
            // Verify code button
            this.$parent.on('click', '[data-mz-action="verify-twofa"]', function(e) {
                e.preventDefault();
                var code = self.$parent.find('[data-mz-twofa-code]').val();
                self.verifySignup2FACode(code);
            });
            
            // Resend code
            this.$parent.on('click', '[data-mz-action="resend-twofa-code"]', function(e) {
                e.preventDefault();
                var email = self.$parent.data('twoFA-email');
                self.resendSignup2FACode(email);
            });
            
            // Back to signup
            this.$parent.on('click', '[data-mz-action="backto-signup"]', function(e) {
                e.preventDefault();
                self.cancelSignup2FAChallenge();
            });
            
            // Auto-verify when 6 digits are entered
            this.$parent.on('input', '[data-mz-twofa-code]', function() {
                var codeValue = $(this).val();
                if (codeValue.length === 6) {
                    self.verifySignup2FACode(codeValue);
                }
            });
        },
        sendSignup2FACode: function(email) {
            var self = this;
            
            // Generate 2FA OTP using API
            api.action('customer', 'generateAndSend2faOtp', {
                email: email
            }).then(function(response) {
                // Store session data
                self.$parent.data('twoFA-email', email);
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                // Get the message container within the 2FA UI
                var $messageContainer = self.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                // Show success message
                if ($messageContainer.length > 0) {
                    var successClass = 'mz-validationmessage-success';
                    $messageContainer.html("<span class='" + successClass + "'>" + Hypr.getLabel('twoFACodeSent', email) + '</span>');
                } else {
                    // Fallback to normal display message
                    self.displayMessage(Hypr.getLabel('twoFACodeSent', email), 'success');
                }
                
            })["catch"](function(error) {
                // Get the message container within the 2FA UI
                var $messageContainer = self.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                // Show error message
                if ($messageContainer.length > 0) {
                    var errorClass = 'mz-validationmessage';
                    $messageContainer.html("<span class='" + errorClass + "'>" + error.message + '</span>');
                } else {
                    // Fallback to normal display message
                    self.displayMessage(error.message, 'error');
                }
            });
        },
        verifySignup2FACode: function(enteredCode) {
            var email = this.$parent.data('twoFA-email');
            var sessionId = this.$parent.data('twoFA-sessionId');
            
            // Show loading state
            var $input = this.$parent.find('[data-mz-twofa-code]');
            $input.prop('disabled', true);

            var returnUrl = "";
            var returnUrlParam = getQueryParam('returnUrl');
            if (returnUrlParam && !this.$parent.find('input[name=returnUrl]').val()){
              returnUrl = returnUrlParam;
            } else {
              returnUrl = this.$parent.find('input[name=returnUrl]').val();
            }

            var self = this;
            
            // Validate 2FA using API
            api.action('customer', 'validate2faAndCreateAuthTicket', {
                OtpCode: enteredCode            
            }).then(function(response) {
                // Get the message container within the 2FA UI
                var $messageContainer = self.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                // Show success message
                if ($messageContainer.length > 0) {
                    var successClass = 'mz-validationmessage-success';
                    $messageContainer.html("<span class='" + successClass + "'>" + Hypr.getLabel('twoFACodeVerified') + '</span>');
                } else {
                    // Fallback to normal display message
                    self.displayMessage(Hypr.getLabel('twoFACodeVerified'), 'success');
                }
                
                // Clear 2FA flag and remove form submission prevention
                self.is2FAInProgress = false;
                self.$parent.off('submit.twofa');
                
                // Skip completeSignupWith2FA since API already handles account creation
                // Go directly to post-registration navigation
                 self.handleLoginComplete.bind(self, returnUrl)();
                
            })["catch"](function(error) {
                // Handle error
                $input.prop('disabled', false);
                
                var errorMessage = "";
                var shouldReset2FA = false;
                
                // Check for specific error conditions based on API response
                if (error && error.result && error.result.message) {
                    var apiMessage = error.result.message;
                    
                    if (apiMessage.toLowerCase().includes('invalid otp')) {
                        errorMessage = Hypr.getLabel('twoFACodeIncorrect');
                    } else if (apiMessage.toLowerCase().includes('retry count exceeded')) {
                        errorMessage = Hypr.getLabel('twoFARetryExceeded');
                        shouldReset2FA = true;
                    } else if (apiMessage.toLowerCase().includes('generate a new otp.')) {
                        errorMessage = Hypr.getLabel('twoFAExpired');
                        shouldReset2FA = true;
                    } else {
                        errorMessage = apiMessage;
                    }
                } 
                
                self.displayMessage(errorMessage, 'error');
                
                if (shouldReset2FA) {
                    // Simply update the resend button text to "Request New Code"
                    var $resendLink = self.$parent.find('[data-mz-action="resend-twofa-code"]');
                    if ($resendLink.length > 0) {
                        $resendLink.text(Hypr.getLabel('requestNewCode'));
                    }
                    
                    // Clear the input field and focus
                    self.$parent.find('[data-mz-twofa-code]').val('').focus();
                } else {
                    // Clear the input field and allow retry
                    self.$parent.find('[data-mz-twofa-code]').val('').focus();
                }
            });
        },
        completeSignupWith2FA: function() {
            var self = this;
            var signupPayload = this.$parent.data('signupPayload');
            
            // Add 2FA code to signup payload and proceed directly to API call
            var twoFACode = this.$parent.find('[data-mz-twofa-code]').val();
            if (twoFACode) {
                signupPayload.twoFactorCode = twoFACode;
            }
            
            this.setLoading(true);
            
            return api.action('customer', 'createStorefront', signupPayload).then(function () {
                if (self.redirectTemplate) {
                    window.location.pathname = self.redirectTemplate;
                }
                else {
                    window.location.reload();
                }
            }, function(error) {
                self.setLoading(false);
                self.displayApiMessage(error);
            });
        },
        resendSignup2FACode: function(email) {
            var self = this;
            var $resendLink = this.$parent.find('[data-mz-action="resend-twofa-code"]');
            
            $resendLink.text(Hypr.getLabel('sending')).addClass('is-loading');
            
            // Generate new 2FA OTP using API
            api.action('customer', 'generateAndSend2faOtp', {
                email: email
            }).then(function(response) {
                // Update session data
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                // Get the message container within the 2FA UI
                var $messageContainer = self.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                // Show success message
                if ($messageContainer.length > 0) {
                    var successClass = 'mz-validationmessage-success';
                    $messageContainer.html("<span class='" + successClass + "'>" + Hypr.getLabel('twoFACodeSent', email) + '</span>');
                } else {
                    // Fallback to normal display message
                    self.displayMessage(Hypr.getLabel('twoFACodeSent', email), 'success');
                }
                
                $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
                
                // Clear the input field
                self.$parent.find('[data-mz-twofa-code]').val('').focus();
                
            })["catch"](function(error) {
                // Handle error
                var errorMessage = Hypr.getLabel('twoFASendFailed');
                
                // Check for specific error conditions
                if (error && error.message) {
                    if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        errorMessage = Hypr.getLabel('twoFARateLimited');
                    }
                }
                
                // Get the message container within the 2FA UI
                var $messageContainer = self.$parent.find('.mz-twofa-message-row .mz-popover-message');
                
                // Show error message
                if ($messageContainer.length > 0) {
                    var errorClass = 'mz-validationmessage';
                    $messageContainer.html("<span class='" + errorClass + "'>" + errorMessage + '</span>');
                } else {
                    // Fallback to normal display message
                    self.displayMessage(errorMessage, 'error');
                }
                
                $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
            });
        }
    });
    SignupPopover.prototype.signup = _.debounce(SignupPopover.prototype.signup, 150);

    $(document).ready(function() {
        $docBody = $(document.body);
        
        /**
         * Helper function to display messages - available to all event handlers within document.ready
         * This centralized function ensures consistent message formatting and display logic
         * @param {string} message - The message text to display
         * @param {string} type - Message type: 'error' or 'success'
         * @param {jQuery} $messageArea - Optional specific message area element, auto-detects if not provided
         */
        var displayMessage = function(message, type, $messageArea) {
            var messageClass = type === 'error' ? 'mz-validationmessage' : 'mz-validationmessage-success';
            
            // If no specific message area provided, try to find one, but only in login forms, not order status forms
            if (!$messageArea || $messageArea.length === 0) {
                $messageArea = $('.mz-loginform-page:not(.mz-anonymousorder-form)').find('[data-mz-role="popover-message"]:visible').first();
            }
            
            if ($messageArea && $messageArea.length > 0) {
                $messageArea.html('<span class="' + messageClass + '">' + message + '</span>');
            }
        };

        function isValidEmail(email) {
            return email.match(Backbone.Validation.patterns.email);
        }
        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
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
            });        });        
          // Initialize forgot password popover with comprehensive error handling
        $('.mz-loginform-page:not(.mz-anonymousorder-form)').find('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('.mz-loginform-page:not(.mz-anonymousorder-form)').find('[data-mz-action="otplogin"]').on('click', function(e) {
            e.preventDefault();
            
            // Check if OTP login is allowed
            if (!HyprLiveContext.locals.siteContext.generalSettings.isEmailOtpLoginAllowed) {
                return;
            }
            
            // Only apply OTP functionality to login forms, not order status forms
            var $form = $(this).closest('.mz-loginform-page:not(.mz-anonymousorder-form)');
            if ($form.length === 0) {
                return; // Not on a supported page
            }
            
            // Set OTP flag and prevent form submission during OTP flow
            $form.data('mz-is-otp-in-progress', true);
            $form.on('submit.otp', function(e) {
                e.preventDefault();
                return false;
            });
            
            var $passwordRow = $form.find('input[data-mz-login-password]').closest('.mz-l-formfieldgroup-row');
            var $loginButton = $form.find('[data-mz-action="loginpage-submit"], [data-mz-action="recaptcha-submit"]');
            var $linksRow = $form.find('.mz-forgot').closest('.mz-l-formfieldgroup-row');
            var $emailField = $form.find('input[data-mz-login-email]');
            var $emailLabel = $emailField.closest('.mz-l-formfieldgroup-row').find('label');
            
            // Store original label text for restoration
            $form.data('originalEmailLabel', $emailLabel.text());
            
            // Change email label to "Email Address" only
            $emailLabel.text(Hypr.getLabel('emailAddress'));
            
            // Validate current email field value - if it's not a valid email, clear it
            var currentValue = $emailField.val();
            if (currentValue && !isValidEmail(currentValue)) {
                $emailField.val('');
            }
            
            // Hide password field
            $passwordRow.hide();
            
            // Hide the forgot password and OTP links
            $linksRow.hide();
            
            // Create a separate "Request Code" button instead of changing the existing one
            var requestCodeButtonHtml = '<div class="mz-l-formfieldgroup-row mz-otp-request-row">' +
                                       '<div class="mz-l-formfieldgroup-cell"></div>' +
                                       '<div class="mz-l-formfieldgroup-cell">' +
                                       '<section data-mz-role="popover-message" class="mz-popover-message"></section>'+
                                       '<button type="button" class="mz-button mz-request-code-button" data-mz-action="request-otp-code">'+Hypr.getLabel("requestCode")+'</button>' +
                                       '</div>' +
                                       '</div>';
            
            // Insert the Request Code button before the original login button
            $loginButton.closest('.mz-l-formfieldgroup-row').before(requestCodeButtonHtml);
            
            // Hide the original login button
            $loginButton.closest('.mz-l-formfieldgroup-row').hide();
            
            // Add a "Back to Password Login" link
            var backLinkHtml = '<div class="mz-l-formfieldgroup-row mz-otp-back-row">' +
                              '<div class="mz-l-formfieldgroup-cell"></div>' + 
                              '<div class="mz-l-formfieldgroup-cell">' +
                              '<a href="#" class="mz-back-to-password" data-mz-action="backtopassword">' + Hypr.getLabel('backToPasswordLogin') + '</a>' +
                              '</div>' +
                              '</div>';
            
            $('.mz-otp-request-row').after(backLinkHtml);
              // Add event handler for "Back to Password Login"
            $form.on('click', '[data-mz-action="backtopassword"]', function(e) {
                e.preventDefault();
                
                // Clear OTP flag and remove form submission prevention
                $form.data('mz-is-otp-in-progress', false);
                $form.off('submit.otp');
                
                // Regular login form - restore original email label and show hidden fields
                var $emailField = $form.find('input[data-mz-login-email]');
                var $emailLabel = $emailField.closest('.mz-l-formfieldgroup-row').find('label');
                var originalLabel = $form.data('originalEmailLabel');
                if (originalLabel) {
                    $emailLabel.text(originalLabel);
                }
                
                // Show password field and links again
                $passwordRow.show();
                $linksRow.show();
                
                // Show the email input field again
                var $emailRow = $form.find('input[data-mz-login-email]').closest('.mz-l-formfieldgroup-row');
                $emailRow.show();
                
                // Show the original login button
                $loginButton.closest('.mz-l-formfieldgroup-row').show();
                
                // Remove all OTP-specific elements
                $('.mz-otp-request-row, .mz-otp-back-row, .mz-otp-instruction-row, .mz-otp-input-row, .mz-otp-resend-row').remove();
                
                // Clear form data
                $form.removeData('otpEmail otpSessionId originalEmailLabel');
                
                // Remove event handlers to prevent duplicates
                $form.off('click', '[data-mz-action="backtopassword"]');
                $form.off('click', '[data-mz-action="request-otp-code"]');
                $form.off('input', '[data-mz-otp-code]');
                $form.off('click', '[data-mz-action="resend-otp-code"]');
                
                // Clear any messages
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                $messageArea.empty();
            });              
            // Add event handler for Request Code button
            $form.on('click', '[data-mz-action="request-otp-code"]', function(e) {
                e.preventDefault();
                
                var $requestButton = $(this);
                var email = $form.find('input[data-mz-login-email]').val();
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                
                // Validate email
                if (!email) {
                    displayMessage('Please enter your email address to request a one-time password.', 'error', $messageArea);
                    $form.find('input[data-mz-login-email]').focus();
                    return;
                }
                
                // Validate email format
                if (!isValidEmail(email)) {
                    displayMessage('Please enter a valid email address.', 'error', $messageArea);
                    $form.find('input[data-mz-login-email]').focus();
                    return;
                }
                
                // Show loading state
                $requestButton.prop('disabled', true).text(Hypr.getLabel('requesting'));
                
                // Generate OTP using API
                api.action('customer', 'generateAndSendOtp', {
                    email: email
                }).then(function(response) {                    // Store OTP session data
                    $form.data('otpEmail', email);
                    $form.data('otpSessionId', response.sessionId || 'otp-session');
                    
                    // Hide the Request Code button
                    $requestButton.closest('.mz-otp-request-row').hide();
                    
                    // Show OTP input field and resend link
                    showOtpInputUI($form, email);                      
                })['catch'](function(error) {
                    // Handle error
                    var errorMessage = Hypr.getLabel('twoFASendFailed');
                    
                    // Check for specific error conditions
                    if (error && error.message) {
                        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                            errorMessage = Hypr.getLabel('twoFARateLimited');
                        } else if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('not found')) {
                            errorMessage = "Email address not found. Please check your email and try again.";
                        }
                    }
                    
                    // Check for 302 redirect or authentication issues
                    if (error.status === 302 || error.statusCode === 302 || 
                        (error.message && error.message.toLowerCase().includes('redirect')) ||
                        (error.message && error.message.toLowerCase().includes('unauthorized')) ||
                        (error.message && error.message.toLowerCase().includes('authentication'))) {
                        // Session expired or user not authenticated
                        errorMessage = "Your session has expired. Please refresh the page and try logging in again.";
                        // Optionally, we could redirect to login page
                        setTimeout(function() {
                            window.location.reload();
                        }, 3000);
                    }
                    
                    var $messageArea = $form.find('[data-mz-role="popover-message"]');
                    displayMessage(errorMessage, 'error', $messageArea);
                    
                    // Reset button state
                    $requestButton.prop('disabled', false).text(Hypr.getLabel('requestCode'));
                });
            });
            
            // Function to show OTP input UI
            function showOtpInputUI($form, email) {
                // Hide the email input field since it's no longer needed during verification
                var $emailRow = $form.find('input[data-mz-login-email]').closest('.mz-l-formfieldgroup-row');
                $emailRow.hide();
                
                var otpInputHtml ='<div class="mz-l-formfieldgroup-row mz-otp-input-row">' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<label for="mz-otp-code">' + Hypr.getLabel("verificationCode") + '</label>' +
                                  '</div>' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<input type="text" id="mz-otp-code" data-mz-otp-code maxlength="6" placeholder="'+ Hypr.getLabel('enter6DigitCode') +'" autocomplete="one-time-code" pattern="[0-9]{6}" required>' +
                                  '</div>' +
                                  '</div>' +
                                  '<section data-mz-role="popover-message" class="mz-popover-message"></section>' +
                                  '<div class="mz-l-formfieldgroup-row mz-otp-resend-row">' +
                                  '<div class="mz-l-formfieldgroup-cell"></div>' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<a href="#" class="mz-resend-code" data-mz-action="resend-otp-code">'+ Hypr.getLabel('resendCode') +'</a>' +
                                  '</div>' +
                                  '</div>';
                
                $('.mz-otp-back-row').before(otpInputHtml);
                
                // Show success message that OTP was sent
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                displayMessage(Hypr.getLabel('otpSentMessage'), 'success', $messageArea);
                
                // Focus on the OTP input
                $('#mz-otp-code').focus();
                
                // Add input event listener for auto-verification
                $form.on('input', '[data-mz-otp-code]', function() {
                    var otpValue = $(this).val();
                    if (otpValue.length === 6) {
                        // Auto-verify when 6 digits are entered
                        verifyOtpCode($form, otpValue);
                    }
                });
                
                // Add resend code event listener
                $form.on('click', '[data-mz-action="resend-otp-code"]', function(e) {
                    e.preventDefault();
                    resendOtpCode($form, email);
                });
            }              // Function to verify OTP code
            function verifyOtpCode($form, enteredCode) {
                var email = $form.data('otpEmail');
                var sessionId = $form.data('otpSessionId');

                var returnUrl = "";
                var returnUrlParam = getQueryParam('returnUrl');
                if (returnUrlParam && !$form.find('input[name=returnUrl]').val()){
                    returnUrl = returnUrlParam;
                } else {
                    returnUrl = $form.find('input[name=returnUrl]').val();
                }
                
                // Show loading state
                var $input = $form.find('[data-mz-otp-code]');
                $input.prop('disabled', true);
                  // Validate OTP using API
                api.action('customer', 'validateOtpAndCreateAuthTicket', {
                    email: email,
                    OtpCode: enteredCode                
                }).then(function(response) {
                    // Success - server will handle redirect internally
                    showOtpSuccess($form);
                    
                    // Clear OTP flag and remove form submission prevention
                    $form.data('mz-is-otp-in-progress', false);
                    $form.off('submit.otp');

                    // Handle login complete - redirect or reload
                    if (returnUrl) {
                        window.location.href = returnUrl;
                    } else {
                        window.location.reload();
                    }

                })
                ['catch'](function(error) {
                    // Handle error
                    $input.prop('disabled', false);
                    
                    var errorMessage = "";
                    var shouldReset = false;
                    
                    // Check for specific error conditions based on API response
                    if (error && error.result && error.result.message) {
                        var apiMessage = error.result.message;
                        
                        if (apiMessage.toLowerCase().includes('invalid otp')) {
                            errorMessage = Hypr.getLabel('otpCodeIncorrect');
                        } else if (apiMessage.toLowerCase().includes('retry count exceeded')) {
                            errorMessage = Hypr.getLabel('otpRetryExceeded');
                            shouldReset = true;
                        } else if (apiMessage.toLowerCase().includes('generate a new otp.')) {
                            errorMessage = Hypr.getLabel('otpExpired');
                            shouldReset = true;
                        } else {
                            errorMessage = apiMessage;
                        }
                    } 

                    showOtpError($form, errorMessage);
                    
                    if (shouldReset) {
                        // Simply update the resend button text to "Request New Code"
                        var $resendLink = $form.find('[data-mz-action="resend-otp-code"]');
                        if ($resendLink.length > 0) {
                            $resendLink.text(Hypr.getLabel('requestNewCode'));
                        }
                        
                        // Clear the input field and focus
                        $form.find('[data-mz-otp-code]').val('').focus();
                    } else {
                        // Clear the input field and allow retry
                        $form.find('[data-mz-otp-code]').val('').focus();
                    }
                });
            }
              // Function to resend OTP code
            function resendOtpCode($form, email) {
                var $resendLink = $form.find('[data-mz-action="resend-otp-code"]');
                $resendLink.text(Hypr.getLabel('sending')).addClass('is-loading');                  
                // Generate new OTP using API
                api.action('customer', 'generateAndSendOtp', {
                    email: email
                }).then(function(response) {
                    // Update session data
                    $form.data('otpSessionId', response.sessionId || 'otp-session');
                    
                    showOtpSuccess($form, Hypr.getLabel('otpSentMessage'));
                    $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
                    
                    // Clear the input field
                    $form.find('[data-mz-otp-code]').val('').focus();
                    
                })
                ['catch'](function(error) {
                    // Handle error
                    var errorMessage = Hypr.getLabel('otpSendFailed');
                    
                    // Check for specific error conditions
                    if (error && error.message) {
                        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                            errorMessage = Hypr.getLabel('otpRateLimited');
                        }
                    }
                    
                    showOtpError($form, errorMessage);
                    $resendLink.text(Hypr.getLabel('resendCode')).removeClass('is-loading');
                });
            }
            
            // Function to show OTP error
            function showOtpError($form, message) {
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                displayMessage(message, 'error', $messageArea);
            }
            
            // Function to show OTP success
            function showOtpSuccess($form, message) {
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                var successMessage = message || Hypr.getLabel('otpCodeVerified');
                displayMessage(successMessage, 'success', $messageArea);
            }              
            // Function to reset OTP state
            function resetOtpState($form, isRetryExceeded) {
                if (isRetryExceeded) {
                    // When retry count exceeded, change "Resend Code" to "Request New Code"
                    $('.mz-otp-resend-row .mz-resend-code')
                        .text(Hypr.getLabel('requestNewCode'))
                        .removeClass('mz-resend-code')
                        .addClass('mz-request-new-code')
                        .attr('data-mz-action', 'request-new-otp-code');
                    
                    // Remove the existing resend event handler and add new one
                    $form.off('click', '[data-mz-action="resend-otp-code"]');
                    $form.on('click', '[data-mz-action="request-new-otp-code"]', function(e) {
                        e.preventDefault();
                        // Reset to initial state and start fresh
                        $('.mz-otp-instruction-row, .mz-otp-input-row, .mz-otp-resend-row').remove();
                        $('.mz-otp-request-row').show();
                        $form.removeData('otpEmail otpSessionId');
                        $form.off('input', '[data-mz-otp-code]');
                        $form.off('click', '[data-mz-action="request-new-otp-code"]');
                    });
                } else {
                    // Normal reset - remove OTP-specific UI elements
                    $('.mz-otp-instruction-row, .mz-otp-input-row, .mz-otp-resend-row').remove();
                    
                    // Always show the Request Code button
                    $('.mz-otp-request-row').show();
                    
                    // Clear form data
                    $form.removeData('otpEmail otpSessionId');
                    
                    // Remove OTP-specific event handlers
                    $form.off('input', '[data-mz-otp-code]');
                    $form.off('click', '[data-mz-action="resend-otp-code"]');
                }
            }
              // Handle browser refresh - reset to initial state
            $(window).on('beforeunload', function() {
                // When page is about to unload, ensure we clear any OTP state
                var $forms = $('.mz-loginform-page:not(.mz-anonymousorder-form)');
                $forms.each(function() {
                    var $form = $(this);                    
                    if ($form.find('.mz-otp-input-row').length > 0) {
                        // OTP state exists, it will be cleared on page reload
                        $form.removeData('otpEmail otpSessionId');
                    }
                });
            });
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
