/**
 * Adds a login popover to all login links on a page.
 */
define(['shim!vendor/bootstrap-popover[modules/jquery-mozu=jQuery]>jQuery', 'modules/api', 'hyprlive', 'shim!vendor/underscore>_'], function ($, api, Hypr, _) {

    var usePopovers = function () {
        return !Modernizr.mq('(max-width: 480px)');
    },
    returnFalse = function () {
        return false;
    },
    $docBody;

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function() {
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
        displayApiMessage: function (xhr) {
            this.displayMessage(xhr.message ||
                (xhr && xhr.responseJSON && xhr.responseJSON.message) ||
                Hypr.getLabel('unexpectedError'));
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
        },
        init: function (el) {            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            this.$el.on('click', this.createPopover);
        }
    });

    var LoginPopover = function () {
        DismissablePopover.apply(this, arguments);
    }
    LoginPopover.prototype = new DismissablePopover();
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),
        bindListeners: function(on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function() {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');
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
        slideRight: function () {
            this.$slideboxOuter.css('left', -this.panelWidth);
        },        slideLeft: function () {
            this.$slideboxOuter.css('left', 0);
        },
        login: function () {
            this.setLoading(true);
            api.action('customer', 'loginStorefront', {
                email: this.$parent.find('[data-mz-login-email]').val(),
                password: this.$parent.find('[data-mz-login-password]').val()
            }).then(this.handleLoginComplete, this.displayApiMessage);
        },
        retrievePassword: function () {
            this.setLoading(true);
            api.action('customer', 'resetPasswordStorefront', {
                EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
            }).then(this.displayResetPasswordMessage, this.displayApiMessage);
        },
        handleLoginComplete: function() {
            window.location.reload();
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function () {
        DismissablePopover.apply(this, arguments);
    }
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
        validate: function(payload) {
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            return true;
        },
        signup: function () {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
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
                    password: this.$parent.find('[data-mz-signup-password]').val()
                };
            if (this.validate(payload)) {
                //var user = api.createSync('user', payload);
                this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    window.location.reload();
                }, self.displayApiMessage);
            }
        }
    });


    $(document).ready(function () {
        $docBody = $(document.body);
        $('[data-mz-action="login"]').each(function () {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);        });
        $('[data-mz-action="signup"]').each(function () {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
    });

});