define(['shim!vendor/bootstrap-popover[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'shim!vendor/underscore>_'], function ($, HyprLive, _, Backbone) {

    $(document).ready(function () {
        var loginTemplate = HyprLive.getTemplate('modules/common/login-popover').render(),
            $docBody = $(document.body),

            useLoginPage = function () {
                return Modernizr.mq('(max-width: 480px)');
            },

            returnFalse = function () {
                return false;
            }

        $('[data-mz-action="login"]').each(function () {
            var $this = $(this),
                $parent, // = $this.parent(),
                popoverInstance,
                dismisser = function (e) {
                    // clicking away from a popped popover should dismiss it
                    if (!$.contains(popoverInstance.$tip[0], e.target)) {
                        $this.popover('destroy');
                        $this.on('click', createPopover);
                        $this.off('click', returnFalse);
                        $parent.off('click', '[data-mz-action="forgotpasswordform"]', slideRight);
                        $parent.off('click', '[data-mz-action="loginform"]', slideLeft);
                        $parent.off('click', '[data-mz-action="submitlogin"]', login);
                        $parent.off('click', '[data-mz-action="submitforgotpassword"]', retrievePassword);
                        $parent.off('keypress', 'input', handleEnterKey);
                        $docBody.off('click', dismisser);
                    }
                },                handleEnterKey = function(e) {
                    if (e.which === 13) {
                        var $parentForm = $(this).parents('[data-mz-role]');
                        switch ($parentForm.data('mz-role')) {
                            case "login-form":
                                login();
                                break;
                            case "forgotpassword-form":
                                retrievePassword();
                                break;
                        }
                        return false;
                    }
                },                slideRight = function () {
                    $slideboxOuter.css('left', -panelWidth);
                },                slideLeft = function () {
                    $slideboxOuter.css('left', 0);
                },                displayMessage = function(xhr) {
                    $parent.removeClass('is-loading');
                    $parent.find('[data-mz-role="loginpopover-message"]').html('<span class="mz-validationmessage">' + xhr.responseJSON.Message + '</span>');
                },                login = function () {
                    $parent.addClass('is-loading');
                    $.post('/login', {
                        email: $parent.find('[data-mz-login-email]').val(),
                        password: $parent.find('[data-mz-login-password]').val()
                    }).then(function (res) {
                        window.location.reload();
                    }, displayMessage);
                },                retrievePassword = function () {
                    $parent.addClass('is-loading');
                    $.post('/resetpassword', {
                        EmailAddress: $parent.find('[data-mz-forgotpassword-email]').val()
                    }).always(displayMessage);
                },                $slideboxOuter,                panelWidth,                createPopover = function (e) {
                    // in the absence of JS or in a small viewport, these links go to the login page.
                    // Prevent them from going there!
                    if (!useLoginPage()) {
                        e.preventDefault();
                        // If the parent element's not positioned at least relative,
                        // the popover won't move with a window resize
                        //var pos = $parent.css('position');
                        //if (!pos || pos === "static") $parent.css('position', 'relative');
                        $this.popover({
                            //placement: "auto right",
                            animation: true,
                            html: true,
                            trigger: 'manual',
                            content: loginTemplate,
                            container: 'body'
                        }).on('shown.bs.popover', function () {

                            _.defer(function () {
                                $(document.body).on('click', dismisser);
                                $this.on('click', returnFalse);
                            });

                            popoverInstance = $this.data('bs.popover');
                            $parent = popoverInstance.tip();

                            panelWidth = $parent.find('.mz-l-slidebox-panel').first().outerWidth(),
                            $slideboxOuter = $parent.find('.mz-l-slidebox-outer');

                            $parent.on('click', '[data-mz-action="forgotpasswordform"]', slideRight);
                            $parent.on('click', '[data-mz-action="loginform"]', slideLeft);
                            $parent.on('click', '[data-mz-action="submitlogin"]', login);
                            $parent.on('click', '[data-mz-action="submitforgotpassword"]', retrievePassword);
                            $parent.on('keypress', 'input', handleEnterKey);
                            $this.off('click', createPopover);
                        })
                        .popover('show');

                    }
                };            $this.on('click', createPopover);
        });

    });

});