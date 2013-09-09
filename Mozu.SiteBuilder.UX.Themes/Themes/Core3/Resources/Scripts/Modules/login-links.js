define(['modules/jquery-plus', 'modules/api', 'modules/animatemodals', 'i18n!nls/messages'], function ($, api, animateModals, Messages) {
    return $(document).ready(function () {
        animateModals({ jqSelector: '[data-mz-action="login"]' });

        $('[data-mz-minimodal="login"]').each(function () {
            var $miniModal = $(this),
                $slidingWindow = $miniModal.find('.mz-hbox-sliding-window'),

                showPasswordPanel = function (yes) {
                    if (yes) {
                        $slidingWindow.addClass('showright');
                    } else {
                        $slidingWindow.removeClass('showright');
                    }
                },

                $responseField = $miniModal.find('[data-mz-role="ajaxresponse"]'),
                hideMessages = function () {
                    $responseField.removeClass('error').hide().html('');
                }
                showMessage = function (msg, isError) {
                    if (isError) $responseField.addClass('error');
                    $responseField.html(msg).show();
                },

                mmForms = $miniModal.find('[data-mz-role$="form"]').each(function () {
                    var $this = $(this);
                    $this.find('input').on('keyup', function (e) {
                        // *** 'Enter' key pressed
                        if (e.which == 13) {
                            $this.find('[data-mz-role="ajaxform-submit"]').click();
                        }
                    })
                });

            /**
              * AJAX handlers for Login/Logout
              */

            var $loginForm = mmForms.filter('[data-mz-role="login-form"]'),
                $forgotPasswordForm = mmForms.filter('[data-mz-role="forgotpassword-form"]');

            $loginForm.on('click', '[data-mz-role="ajaxform-submit"]', function () {
                var email = $loginForm.find("[name=email]"),
                    password = $loginForm.find("[type=password]"),
                    data = {
                        email: email.val(),
                        password: password.val()
                    };
                hideMessages();
                $.ajax({
                    type: 'POST',
                    url: '/auth/AjaxSignIn',
                    data: data,
                    success: function (response) {
                        if (response.success) {
                            // login with the api client as well
                            api.action('user', 'login', {
                                EmailAddress: email.val(),
                                Password: password.val()
                            }).then(function() {
                                window.location.reload(true);
                            });
                        } else {
                            showMessage(response.message, true);
                            console.log(response.message);
                        }
                    },
                    error: function(response) {
                        showMessage(response.message, true);
                    },
                    dataType: 'json'
                });

                return false;
            })

            /**
              * Toggle Forgot Password
              */
            .on("click", '[data-mz-action="forgotpassword"]', function () {
                // *** Preserve any text already entered into email field
                $forgotPasswordForm.find('[name="email"]').val($loginForm.find('[name="email"]').val());
                showPasswordPanel(true);

                return false;
            });

            /**
              * AJAX handler for Forgot Password
              */
            $forgotPasswordForm.on('click', '[data-mz-role="ajaxform-submit"]', function () {
                $.ajax({
                    type: "POST",
                    url: "/auth/AjaxResetPassword", // TODO Confirm naming convention ( /auth/AjaxSignIn vs /auth/LogOut )
                    data: { email: $forgotPasswordForm.find('[type=email]').val() },
                    success: function (response) {
                        if (response.success) {
                            mmForms.hide();

                            // *** Show the message from the response (default text if response.message is null)                            showMessage(response.message || Messages.PasswordResetEmailSent);
                            var $body = $(document.body);

                            // *** Close the modal after 3.5 seconds
                            setTimeout(function () {
                                $body.trigger("click.close-animated-modal");
                            }, 3500);

                            // *** Hook into "afterclose" event of animated modal
                            $body.one('onAnimatedModalClose', function () {
                                hideMessages();
                                showPasswordPanel(false);
                            });
                        } else {
                            showMessage(Messages.NoAccountFound, true);
                        }
                    },
                    dataType: 'json'
                });

                return false;
            })

                /**
              * Toggle back to login
              */
            .on("click", '[data-mz-action="back-login"]', function () {
                showPasswordPanel(false);

                return false;
            });
        });

        $('[data-mz-action="logout"]').on('click', function () {
            $.ajax({
                type: 'POST',
                url: '/auth/LogOut',
                data: {},
                success: function (response) {
                    if (response.success) {
                        window.location.reload(true);
                    } else {
                        console.log(response.message);
                    }
                },
                dataType: 'json'
            });

            return false;
        });
    });
});