define(['jquery', 'modules/animatemodals', 'i18n!nls/messages'], function ($, animateModals, Messages) {
    return $(document).ready(function () {
        animateModals({ jqSelector: '[data-mz-action="login"]' });

        $('[data-mz-minimodal="login"]').each(function () {
            var miniModal = $(this),
                mmForms = miniModal.find('[data-mz-ajaxform="true"]').each(function () {
                    var $this = $(this);
                    $this.find('[type=email], [type=password]').on('keyup', function (e) {
                        // *** 'Enter' key pressed
                        if (e.which == 13) {
                            $this.find('[type=submit]').click();
                        }
                    })
                });

            /**
              * AJAX handlers for Login/Logout
              */
            miniModal.on('click', '[data-mz-role="loginform"] :submit', function () {
                var firstForm = mmForms.first(),
                    email = firstForm.find("[type=email]"),
                    password = firstForm.find("[type=password]"),
                    data = {
                        email: email.val(),
                        password: password.val()
                    };

                $.ajax({
                    type: 'POST',
                    url: '/user/AjaxSignIn',
                    data: data,
                    success: function (response) {
                        if (response.success) {
                            console.log('Welcome ' + response.data.firstName);
                            window.location.reload(true);
                        } else {
                            console.log(response.message);
                        }
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
                mmForms.find('[type=email]').val(mmForms.filter(':visible').find('input[name="email"]').first().val());
                mmForms.toggle();

                return false;
            })

            /**
              * AJAX handler for Forgot Password
              */
            .on('click', '[data-mz-role="forgotpasswordform"] :submit', function () {
                $.ajax({
                    type: "POST",
                    url: "/user/AjaxResetPassword", // TODO Confirm naming convention ( /user/AjaxSignIn vs /user/LogOut )
                    data: { email: $('[data-mz-role="forgotpasswordform"] [type=email]').val() },
                    success: function (response) {
                        if (response.success) {
                            mmForms.hide();

                            // *** Show the message from the response (default text if response.message is null)
                            var ajaxres = miniModal.find('[data-mz-role="ajaxresponse"]').show().text(response.message || Messages.PasswordResetEmailSent),
                                $body = $(document.body);

                            // *** Close the modal after 3.5 seconds
                            setTimeout(function () {
                                $body.trigger("click.close-animated-modal");
                            }, 3500);

                            // *** Hook into "afterclose" event of animated modal
                            $body.one('onAnimatedModalClose', function () {
                                mmForms.first().add(ajaxres).toggle();
                            });
                        } else {
                            alert(Messages.NoAccountFound);
                        }
                    },
                    dataType: 'json'
                });

                return false;
            });
        });

        $('[data-mz-action="logout"]').on('click', function () {
            $.ajax({
                type: 'POST',
                url: '/user/LogOut',
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