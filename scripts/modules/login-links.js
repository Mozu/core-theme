/* globals grecaptcha */

/**
 * Adds a login popover to all login links on a page.
 */
define(['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'hyprlivecontext', 'vendor/jquery-placeholder/jquery.placeholder'],
     function ($, api, Hypr, _, HyprLiveContext) {    var usePopovers = function() {
        // Check if Modernizr is available and test for larger screens
        var result = (typeof Modernizr !== 'undefined') && !Modernizr.mq('(max-width: 480px)');
        return result;
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
        },        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            
            if (usePopovers()) {
                e.preventDefault();
                
                // Check if Bootstrap popover is available
                if (typeof $.fn.popover === 'undefined') {
                    return; // Let the link redirect naturally
                }
                
                try {
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
                } catch (error) {
                    // Fall back to page navigation
                    window.location.href = e.target.href;
                }
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
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: (function() {
            try {
                var template = Hypr.getTemplate('modules/common/login-popover').render();
                return template;
            } catch (e) {
                return '<div class="mz-popover-error">Template loading failed</div>';
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
            // Check if 2FA challenge is required before proceeding with login
            var requires2FA = this.check2FARequired();
            if (requires2FA && !this.is2FAInProgress) {
                this.start2FAChallenge();
                return;
            }

            this.setLoading(true);

            //NGCOM-623
            //If a returnUrl has been specified in the url query and there
            //is no returnUrl value provided by the server,
            //we'll use the one specified in the url query. If a returnURl has been
            //provided by the server, it will live in an invisible input in the
            //login links box.

            var returnUrl = "";
            var returnUrlParam = new URLSearchParams(window.location.search).get('returnUrl'); // jshint ignore:line
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

            api.action('customer', 'loginStorefront', data).then(this.handleLoginComplete.bind(this, returnUrl), this.displayApiMessage);

        },        anonymousorder: function() {
            // Check if 2FA challenge is required before proceeding with order login
            var requires2FA = this.check2FARequired();
            if (requires2FA && !this.is2FAInProgress) {
                this.start2FAChallenge();
                return;
            }

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
            }        },
        check2FARequired: function() {
            // Check if any 2FA settings are enabled
            var siteContext = HyprLiveContext.locals.siteContext;
            return siteContext.generalSettings.is2FAAlwaysRequired ||
                   siteContext.generalSettings.is2FARequiredOnFingerprintChange ||
                   siteContext.generalSettings.is2FARequiredOnRegionChange;
        },        start2FAChallenge: function() {
            var self = this;
            
            // Determine if this is regular login or order status
            var isOrderStatus = this.$parent.hasClass('mz-anonymousorder-form');
            
            if (isOrderStatus) {
                // For order status, validate order number and verification
                var orderNumber = this.$parent.find('[data-mz-order-number]').val();
                var verification = this.$parent.find('[data-mz-verification]').val();
                
                if (!orderNumber || !verification) {
                    this.displayMessage('Please enter both order number and verification information.');
                    return;
                }
                
                // Store values for later use
                this.$parent.data('orderLoginData', {
                    orderNumber: orderNumber,
                    verification: verification,
                    verifyWith: this.$parent.find('[data-mz-verify-with]').val()
                });
                
                // Use verification value as email for 2FA
                this.show2FAChallenge(verification);
            } else {
                // Regular login validation
                var email = this.$parent.find('[data-mz-login-email]').val();
                var password = this.$parent.find('[data-mz-login-password]').val();
                
                if (!email || !password) {
                    this.displayMessage('Please enter both email and password.');
                    return;
                }
                
                // Show 2FA challenge with email
                this.show2FAChallenge(email);
            }
            
            // Set flag to indicate 2FA is in progress
            this.is2FAInProgress = true;
        },        show2FAChallenge: function(email) {
            var self = this;
            var isOrderStatus = this.$parent.hasClass('mz-anonymousorder-form');
            
            // Hide original form elements based on form type
            if (isOrderStatus) {
                // Hide order status form elements
                var $orderNumberRow = this.$parent.find('input[data-mz-order-number]').closest('.mz-l-formfieldgroup-row');
                var $verifyWithRow = this.$parent.find('select[data-mz-verify-with]').closest('.mz-l-formfieldgroup-row');
                var $verificationRow = this.$parent.find('input[data-mz-verification]').closest('.mz-l-formfieldgroup-row');
                var $otpLinksRow = this.$parent.find('.mz-otp-login').closest('.mz-l-formfieldgroup-row');
                var $submitButtonRow = this.$parent.find('[data-mz-action="anonymousorder-submit"]').closest('.mz-l-formfieldgroup-row');
                
                $orderNumberRow.hide();
                $verifyWithRow.hide();
                $verificationRow.hide();
                $otpLinksRow.hide();
                $submitButtonRow.hide();
            } else {
                // Hide regular login form elements
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
            }
              // Show 2FA challenge UI
            var twoFAHtml = '<div class="mz-l-formfieldgroup-row mz-twofa-title-row">' +
                           '<div class="mz-l-formfieldgroup-cell" colspan="2">' +
                           '<h3>Verification Required</h3>' +
                           '<p>A 6-digit verification code has been sent to your email address.</p>' +
                           '</div>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-input-row">' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<label for="mz-twofa-code">Verification Code</label>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<input type="text" id="mz-twofa-code" data-mz-twofa-code maxlength="6" placeholder="Enter 6-digit code" autocomplete="one-time-code" pattern="[0-9]{6}" required>' +
                           '</div>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-buttons-row">' +
                           '<div class="mz-l-formfieldgroup-cell"></div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<button type="button" class="mz-button mz-button-large mz-verify-twofa-button" data-mz-action="verify-twofa">Verify Code</button>' +
                           '<a href="#" class="mz-resend-twofa" data-mz-action="resend-twofa-code">Resend Code</a>' +
                           '</div>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-back-row">' +
                           '<div class="mz-l-formfieldgroup-cell"></div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<a href="#" class="mz-back-to-login" data-mz-action="backto-login">Back to Login</a>' +
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
        },        send2FACode: function(email) {
            var self = this;
            
            // Generate 2FA OTP using API
            api.action('customer', 'generateAndSend2FAOtp', {
                EmailAddress: email
            }).then(function(response) {
                // Store session data
                self.$parent.data('twoFA-attempts', 0);
                self.$parent.data('twoFA-email', email);
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                // Show success message
                self.show2FAMessage('If your account requires 2FA, a verification code has been sent to your email address.', 'success');
                
            })["catch"](function(error) {
                // Handle error
                var errorMessage = "Failed to send verification code. Please try again.";
                
                // Check for specific error conditions
                if (error && error.message) {
                    if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
                    } else if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('not found')) {
                        errorMessage = "Email address not found. Please check your email and try again.";
                    }
                }
                
                self.show2FAMessage(errorMessage, 'error');
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
        },        verify2FACode: function(enteredCode) {
            var attempts = this.$parent.data('twoFA-attempts') || 0;
            var email = this.$parent.data('twoFA-email');
            var sessionId = this.$parent.data('twoFA-sessionId');
            var maxAttempts = 3;
            
            attempts++;
            this.$parent.data('twoFA-attempts', attempts);
            
            // Show loading state
            var $input = this.$parent.find('[data-mz-twofa-code]');
            $input.prop('disabled', true);
            
            var self = this;
            
            // Validate 2FA using API
            api.action('customer', 'validate2FAAndCreateAuthTicket', {
                OtpCode: enteredCode
            }).then(function(response) {
                // Success - proceed with login
                self.$parent.data('verified2FACode', enteredCode);
                self.show2FAMessage('Code verified successfully. Logging you in...', 'success');
                setTimeout(function() {
                    self.complete2FAChallenge();
                }, 1000);
                
            })["catch"](function(error) {
                // Handle error
                $input.prop('disabled', false);
                
                var errorMessage = "The code you entered is incorrect. Please try again.";
                
                // Check for specific error conditions
                if (error && error.message) {
                    if (error.message.toLowerCase().includes('expired')) {
                        errorMessage = "The code has expired. Please request a new one.";
                        self.reset2FAChallenge();
                        return;
                    } else if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('incorrect')) {
                        // Use the default incorrect message with attempts
                    } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        errorMessage = "Too many attempts. Please request a new code.";
                        self.reset2FAChallenge();
                        return;
                    }
                }
                
                if (attempts >= maxAttempts) {
                    self.show2FAMessage("You have entered an incorrect code too many times. Please request a new code.", 'error');
                    self.reset2FAChallenge();
                } else {
                    var remainingAttempts = maxAttempts - attempts;
                    errorMessage = errorMessage + " (" + remainingAttempts + " attempts remaining)";
                    self.show2FAMessage(errorMessage, 'error');
                    // Clear the input field
                    self.$parent.find('[data-mz-twofa-code]').val('').focus();
                }
            });
        },        resend2FACode: function(email) {
            var self = this;
            var $resendLink = this.$parent.find('[data-mz-action="resend-twofa-code"]');
            
            $resendLink.text('Sending...').addClass('is-loading');
            
            // Generate new 2FA OTP using API
            api.action('customer', 'generateAndSend2FAOtp', {
                EmailAddress: email
            }).then(function(response) {
                // Update session data
                self.$parent.data('twoFA-attempts', 0);
                self.$parent.data('twoFA-sessionId', response.sessionId || '2fa-session');
                
                self.show2FAMessage("A new verification code has been sent to your email address.", 'success');
                $resendLink.text('Resend Code').removeClass('is-loading');
                
                // Clear the input field
                self.$parent.find('[data-mz-twofa-code]').val('').focus();
                
            })["catch"](function(error) {
                // Handle error
                var errorMessage = "Failed to send verification code. Please try again.";
                
                // Check for specific error conditions
                if (error && error.message) {
                    if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
                    }
                }
                
                self.show2FAMessage(errorMessage, 'error');
                $resendLink.text('Resend Code').removeClass('is-loading');
            });
        },cancel2FAChallenge: function() {
            var isOrderStatus = this.$parent.hasClass('mz-anonymousorder-form');
            this.is2FAInProgress = false;
            
            // Remove 2FA UI elements
            this.$parent.find('.mz-twofa-title-row, .mz-twofa-input-row, .mz-twofa-buttons-row, .mz-twofa-back-row, .mz-twofa-request-row').remove();
            
            // Show original form elements based on form type
            if (isOrderStatus) {
                // Show order status form elements
                var $orderNumberRow = this.$parent.find('input[data-mz-order-number]').closest('.mz-l-formfieldgroup-row');
                var $verifyWithRow = this.$parent.find('select[data-mz-verify-with]').closest('.mz-l-formfieldgroup-row');
                var $verificationRow = this.$parent.find('input[data-mz-verification]').closest('.mz-l-formfieldgroup-row');
                var $otpLinksRow = this.$parent.find('.mz-otp-login').closest('.mz-l-formfieldgroup-row');
                var $submitButtonRow = this.$parent.find('[data-mz-action="anonymousorder-submit"]').closest('.mz-l-formfieldgroup-row');
                
                $orderNumberRow.show();
                $verifyWithRow.show();
                $verificationRow.show();
                $otpLinksRow.show();
                $submitButtonRow.show();
            } else {
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
                $loginButtonRow.show();
            }
              // Clear any 2FA data
            this.$parent.removeData('twoFA-attempts twoFA-email twoFA-sessionId verified2FACode orderLoginData');
            
            // Clear any messages
            this.clearMessages();
        },        complete2FAChallenge: function() {
            var isOrderStatus = this.$parent.hasClass('mz-anonymousorder-form');
            
            // Reset 2FA UI but keep the flag true so the corresponding function knows we're completing 2FA
            this.cancel2FAChallenge();
            this.is2FAInProgress = true;
            
            // Create a temporary hidden input with the 2FA code
            var twoFACode = this.$parent.data('verified2FACode') || '123456';
            var $hiddenInput = $('<input type="hidden" data-mz-twofa-code value="' + twoFACode + '">');
            this.$parent.append($hiddenInput);
            
            if (isOrderStatus) {
                // Restore order login data and proceed with anonymousorder
                var orderData = this.$parent.data('orderLoginData');
                if (orderData) {
                    this.$parent.find('[data-mz-order-number]').val(orderData.orderNumber);
                    this.$parent.find('[data-mz-verification]').val(orderData.verification);
                    this.$parent.find('[data-mz-verify-with]').val(orderData.verifyWith);
                }
                this.anonymousorder();
            } else {
                // Get the original login values and proceed with login
                var email = this.$parent.find('[data-mz-login-email]').val();
                var password = this.$parent.find('[data-mz-login-password]').val();
                
                // Set the values back in case they were cleared
                this.$parent.find('[data-mz-login-email]').val(email);
                this.$parent.find('[data-mz-login-password]').val(password);
                
                this.login();
            }
            
            // Clean up after login attempt
            $hiddenInput.remove();
            this.is2FAInProgress = false;
        },
        reset2FAChallenge: function() {
            // Remove 2FA input UI but keep the request/resend interface
            this.$parent.find('.mz-twofa-input-row, .mz-twofa-buttons-row').remove();
            
            // Show request new code button
            var requestNewCodeHtml = '<div class="mz-l-formfieldgroup-row mz-twofa-request-row">' +
                                    '<div class="mz-l-formfieldgroup-cell"></div>' +
                                    '<div class="mz-l-formfieldgroup-cell">' +
                                    '<button type="button" class="mz-button mz-request-twofa-button" data-mz-action="request-new-twofa">Request New Code</button>' +
                                    '</div>' +
                                    '</div>';
            
            this.$parent.find('.mz-twofa-title-row').after(requestNewCodeHtml);
              // Clear 2FA data
            this.$parent.removeData('twoFA-attempts twoFA-email twoFA-sessionId');
            
            // Bind handler for request new code
            var self = this;
            this.$parent.on('click', '[data-mz-action="request-new-twofa"]', function(e) {
                e.preventDefault();
                var email = self.$parent.data('twoFA-email') || self.$parent.find('[data-mz-login-email]').val();
                self.$parent.find('.mz-twofa-request-row').remove();
                self.show2FAInputUI();
                self.send2FACode(email);
            });
        },
        show2FAInputUI: function() {
            var inputHtml = '<div class="mz-l-formfieldgroup-row mz-twofa-input-row">' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<label for="mz-twofa-code">Verification Code</label>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<input type="text" id="mz-twofa-code" data-mz-twofa-code maxlength="6" placeholder="Enter 6-digit code" autocomplete="one-time-code" pattern="[0-9]{6}" required>' +
                           '</div>' +
                           '</div>' +
                           '<div class="mz-l-formfieldgroup-row mz-twofa-buttons-row">' +
                           '<div class="mz-l-formfieldgroup-cell"></div>' +
                           '<div class="mz-l-formfieldgroup-cell">' +
                           '<button type="button" class="mz-button mz-button-large mz-verify-twofa-button" data-mz-action="verify-twofa">Verify Code</button>' +
                           '<a href="#" class="mz-resend-twofa" data-mz-action="resend-twofa-code">Resend Code</a>' +
                           '</div>' +
                           '</div>';
            
            this.$parent.find('.mz-twofa-title-row').after(inputHtml);
            
            // Focus on the input
            $('#mz-twofa-code').focus();
        },
        show2FAMessage: function(message, type) {
            var messageClass = type === 'success' ? 'mz-validationmessage-success' : 'mz-validationmessage';
            var $messageArea = this.$parent.find('[data-mz-role="popover-message"]');
            $messageArea.html('<span class="' + messageClass + '">' + message + '</span>');
        },
        clearMessages: function() {
            var $messageArea = this.$parent.find('[data-mz-role="popover-message"]');
            $messageArea.empty();
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow', 'login', 'check2FARequired', 'start2FAChallenge'],
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

    $(document).ready(function() {
        $docBody = $(document.body);        
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
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var $el = $(this);
            
            try {
                // Check dependencies first
                if (typeof LoginPopover === 'undefined') {
                    throw new Error('LoginPopover class not defined');
                }
                
                if (typeof Hypr === 'undefined') {
                    throw new Error('Hypr template engine not available');
                }
                
                if (!usePopovers()) {
                    return; // Let the link work normally
                }
                
                var popover = new LoginPopover();
                popover.init(this);
                $el.data('mz.popover', popover);
                
            } catch (e) {
                // Fallback: if popover fails, just redirect to forgot password page
                $el.off('click').on('click', function(e) {
                    e.preventDefault();
                    window.location.href = '/user/forgotpassword';
                });
            }        });          $('[data-mz-action="otplogin"]').on('click', function(e) {
            e.preventDefault();
            
            // Check if OTP login is allowed
            if (!HyprLiveContext.locals.siteContext.generalSettings.isEmailOtpLoginAllowed) {
                return;
            }
            
            // Check if we're on the main login page or order status login page
            var $form = $('.mz-loginform-page, .mz-anonymousorder-form');
            if ($form.length === 0) {
                return; // Not on a supported page
            }
            
            var $passwordRow = $form.find('input[data-mz-login-password]').closest('.mz-l-formfieldgroup-row');
            var $loginButton = $form.find('[data-mz-action="loginpage-submit"], [data-mz-action="recaptcha-submit"], [data-mz-action="anonymousorder-submit"]');
            var $linksRow = $form.find('.mz-forgot').closest('.mz-l-formfieldgroup-row');
            
            // Hide password field
            $passwordRow.hide();
            
            // Hide the forgot password and OTP links
            $linksRow.hide();
            
            // Create a separate "Request Code" button instead of changing the existing one
            var requestCodeButtonHtml = '<div class="mz-l-formfieldgroup-row mz-otp-request-row">' +
                                       '<div class="mz-l-formfieldgroup-cell"></div>' +
                                       '<div class="mz-l-formfieldgroup-cell">' +
                                       '<button type="button" class="mz-button mz-request-code-button" data-mz-action="request-otp-code">Request Code</button>' +
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
                              '<a href="#" class="mz-back-to-password" data-mz-action="backtopassword">Back to Password Login</a>' +
                              '</div>' +
                              '</div>';
            
            $('.mz-otp-request-row').after(backLinkHtml);
              // Add event handler for "Back to Password Login"
            $form.on('click', '[data-mz-action="backtopassword"]', function(e) {
                e.preventDefault();
                
                // Show password field and links again
                $passwordRow.show();
                $linksRow.show();
                
                // Show the original login button
                $loginButton.closest('.mz-l-formfieldgroup-row').show();
                  // Remove all OTP-specific elements
                $('.mz-otp-request-row, .mz-otp-back-row, .mz-otp-instruction-row, .mz-otp-input-row, .mz-otp-resend-row').remove();
                
                // Clear form data
                $form.removeData('otpAttempts otpEmail otpSessionId');
                
                // Remove event handlers to prevent duplicates
                $form.off('click', '[data-mz-action="backtopassword"]');
                $form.off('click', '[data-mz-action="request-otp-code"]');
                $form.off('input', '[data-mz-otp-code]');
                $form.off('click', '[data-mz-action="resend-otp-code"]');
                
                // Clear any messages
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                $messageArea.empty();
            });              // Add event handler for Request Code button
            $form.on('click', '[data-mz-action="request-otp-code"]', function(e) {
                e.preventDefault();
                
                var $requestButton = $(this);
                var email = $form.find('input[data-mz-login-email], input[data-mz-order-email]').val();
                
                // Validate email
                if (!email) {
                    var $messageArea = $form.find('[data-mz-role="popover-message"]');
                    $messageArea.html('<span class="mz-validationmessage">Please enter your email address to request a one-time password.</span>');
                    $form.find('input[data-mz-login-email], input[data-mz-order-email]').focus();
                    return;
                }
                
                // Show loading state
                $requestButton.prop('disabled', true).text('Requesting...');
                
                // Generate OTP using API
                api.action('customer', 'generateAndSendOtp', {
                    email: email
                }).then(function(response) {
                    // Store OTP session data
                    $form.data('otpAttempts', 0);
                    $form.data('otpEmail', email);
                    $form.data('otpSessionId', response.sessionId || 'otp-session');
                    
                    // Show success message
                    var $messageArea = $form.find('[data-mz-role="popover-message"]');
                    if ($messageArea.length === 0) {
                        $messageArea = $('<div data-mz-role="popover-message"></div>');
                        $('.mz-otp-request-row').before($messageArea);
                    }
                    $messageArea.html('<span class="mz-validationmessage-success">If an account with that email address exists, a code has been sent to it.</span>');
                    
                    // Hide the Request Code button
                    $requestButton.closest('.mz-otp-request-row').hide();
                    
                    // Show OTP input field and resend link
                    showOtpInputUI($form, email);
                      })
                      ['catch'](function(error) {
                    // Handle error
                    var errorMessage = "Failed to send verification code. Please try again.";
                    
                    // Check for specific error conditions
                    if (error && error.message) {
                        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                            errorMessage = "Too many requests. Please wait a few minutes before trying again.";
                        } else if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('not found')) {
                            errorMessage = "Email address not found. Please check your email and try again.";
                        }
                    }
                    
                    var $messageArea = $form.find('[data-mz-role="popover-message"]');
                    if ($messageArea.length === 0) {
                        $messageArea = $('<div data-mz-role="popover-message"></div>');
                        $('.mz-otp-request-row').before($messageArea);
                    }
                    $messageArea.html('<span class="mz-validationmessage">' + errorMessage + '</span>');
                    
                    // Reset button state
                    $requestButton.prop('disabled', false).text('Request Code');
                });
            });
            
            // Function to show OTP input UI
            function showOtpInputUI($form, email) {
                var otpInputHtml = '<div class="mz-l-formfieldgroup-row mz-otp-instruction-row">' +
                                  '<div class="mz-l-formfieldgroup-cell" colspan="2">' +
                                  '<p>A 6-digit code has been sent to your email address.</p>' +
                                  '</div>' +
                                  '</div>' +
                                  '<div class="mz-l-formfieldgroup-row mz-otp-input-row">' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<label for="mz-otp-code">Verification Code</label>' +
                                  '</div>' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<input type="text" id="mz-otp-code" data-mz-otp-code maxlength="6" placeholder="Enter 6-digit code" autocomplete="one-time-code" pattern="[0-9]{6}" required>' +
                                  '</div>' +
                                  '</div>' +
                                  '<div class="mz-l-formfieldgroup-row mz-otp-resend-row">' +
                                  '<div class="mz-l-formfieldgroup-cell"></div>' +
                                  '<div class="mz-l-formfieldgroup-cell">' +
                                  '<a href="#" class="mz-resend-code" data-mz-action="resend-otp-code">Resend Code</a>' +
                                  '</div>' +
                                  '</div>';
                
                $('.mz-otp-back-row').before(otpInputHtml);
                
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
            }
              // Function to verify OTP code
            function verifyOtpCode($form, enteredCode) {
                var attempts = $form.data('otpAttempts') || 0;
                var email = $form.data('otpEmail');
                var sessionId = $form.data('otpSessionId');
                var maxAttempts = 3;
                
                attempts++;
                $form.data('otpAttempts', attempts);
                
                // Show loading state
                var $input = $form.find('[data-mz-otp-code]');
                $input.prop('disabled', true);
                  // Validate OTP using API
                api.action('customer', 'validateOtpAndCreateAuthTicket', {
                    OtpCode: enteredCode
                }).then(function(response) {
                    // Success - login user
                    showOtpSuccess($form);
                    setTimeout(function() {
                        handleSuccessfulLogin($form);
                    }, 1000);
                    
                })
                ['catch'](function(error) {
                    // Handle error
                    $input.prop('disabled', false);
                    
                    var errorMessage = "The code you entered is incorrect. Please try again.";
                    
                    // Check for specific error conditions
                    if (error && error.message) {
                        if (error.message.toLowerCase().includes('expired')) {
                            errorMessage = "The code has expired. Please request a new one.";
                            resetOtpState($form);
                            return;
                        } else if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('incorrect')) {
                            // Use the default incorrect message with attempts
                        } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                            errorMessage = "Too many attempts. Please request a new code.";
                            resetOtpState($form);
                            return;
                        }
                    }
                    
                    if (attempts >= maxAttempts) {
                        showOtpError($form, "You have entered an incorrect code too many times. Please request a new code.");
                        resetOtpState($form);
                    } else {
                        var remainingAttempts = maxAttempts - attempts;
                        errorMessage = errorMessage + " (" + remainingAttempts + " attempts remaining)";
                        showOtpError($form, errorMessage);
                        // Clear the input field
                        $form.find('[data-mz-otp-code]').val('').focus();
                    }
                });
            }
              // Function to resend OTP code
            function resendOtpCode($form, email) {
                var $resendLink = $form.find('[data-mz-action="resend-otp-code"]');
                $resendLink.text('Sending...').addClass('is-loading');
                  // Generate new OTP using API
                api.action('customer', 'generateAndSendOtp', {
                    email: email
                }).then(function(response) {
                    // Update session data
                    $form.data('otpAttempts', 0);
                    $form.data('otpSessionId', response.sessionId || 'otp-session');
                    
                    showOtpSuccess($form, "A new code has been sent to your email address.");
                    $resendLink.text('Resend Code').removeClass('is-loading');
                    
                    // Clear the input field
                    $form.find('[data-mz-otp-code]').val('').focus();
                    
                })
                ['catch'](function(error) {
                    // Handle error
                    var errorMessage = "Failed to send verification code. Please try again.";
                    
                    // Check for specific error conditions
                    if (error && error.message) {
                        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                            errorMessage = "Too many requests. Please wait a few minutes before trying again.";
                        }
                    }
                    
                    showOtpError($form, errorMessage);
                    $resendLink.text('Resend Code').removeClass('is-loading');
                });
            }
            
            // Function to show OTP error
            function showOtpError($form, message) {
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                $messageArea.html('<span class="mz-validationmessage">' + message + '</span>');
            }
            
            // Function to show OTP success
            function showOtpSuccess($form, message) {
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                var successMessage = message || "Code verified successfully. Logging you in...";
                $messageArea.html('<span class="mz-validationmessage-success">' + successMessage + '</span>');
            }
              // Function to reset OTP state
            function resetOtpState($form) {
                // Remove OTP-specific UI elements
                $('.mz-otp-instruction-row, .mz-otp-input-row, .mz-otp-resend-row').remove();
                
                // Show the Request Code button again
                $('.mz-otp-request-row').show();
                
                // Clear form data
                $form.removeData('otpAttempts otpEmail otpSessionId');
                
                // Remove OTP-specific event handlers
                $form.off('input', '[data-mz-otp-code]');
                $form.off('click', '[data-mz-action="resend-otp-code"]');
                
                // Clear any messages
                var $messageArea = $form.find('[data-mz-role="popover-message"]');
                $messageArea.empty();
            }
            
            // Function to handle successful login
            function handleSuccessfulLogin($form) {
                var isOrderStatus = $form.hasClass('mz-anonymousorder-form');
                
                if (isOrderStatus) {
                    // For order status login, redirect to anonymous account page
                    window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + 
                                          "/my-anonymous-account?returnUrl=" + 
                                          (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/myaccount";
                } else {
                    // For regular login, get return URL
                    var returnUrl = "";
                    var urlParams = window.location.search;
                    var returnUrlMatch = urlParams.match(/returnUrl=([^&]*)/);
                    if (returnUrlMatch && !$form.find('input[name=returnUrl]').val()) {
                        returnUrl = decodeURIComponent(returnUrlMatch[1]);
                    } else {
                        returnUrl = $form.find('input[name=returnUrl]').val();
                    }
                    
                    if (returnUrl) {
                        window.location.href = returnUrl;
                    } else {
                        window.location.reload();
                    }
                }
            }
              // Handle browser refresh - reset to initial state
            $(window).on('beforeunload', function() {
                // When page is about to unload, ensure we clear any OTP state
                var $forms = $('.mz-loginform-page, .mz-anonymousorder-form');
                $forms.each(function() {
                    var $form = $(this);
                    if ($form.find('.mz-otp-input-row').length > 0) {
                        // OTP state exists, it will be cleared on page reload
                        $form.removeData('otpAttempts otpEmail otpSessionId');
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
