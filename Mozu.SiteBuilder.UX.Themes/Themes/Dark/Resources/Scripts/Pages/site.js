require(['jquery', 'modules/animatemodals', 'vendor/jquery.tagcloud.0-0-1', 'modules/jquery-sitemenu'], function ($, animateModals) {

    $(document).ready(function () {

        animateModals({ jqSelector: ".login-link" });

        $('.login-modal').each(function () {
            var miniModal = $(this),
                mmForms = miniModal.find('.ajaxform').each(function () {
                    var $this = $(this);
                    $this.find('[type=email], [type=password]').on('keyup', function (e) {
                        // *** 'Enter' key pressed
                        if(e.which == 13) {
                            $this.find('[type=submit]').click();
                        }
                    })
                });

            /**
              * AJAX handlers for Login/Logout
              */
            miniModal.on('click', '.login :submit', function () {
                var firstForm = mmForms.first(),
                    email = firstForm.find("[type=email]"),
                    password = firstForm.find("[type=password]"),
                    data = {
                        email: email.val(),
                        password: password.val()
                    };

                $.ajax({
                    type: 'POST',
                    url: '/Auth/AjaxSignIn',
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
            .on("click", '.last-row a', function () {
                // *** Preserve any text already entered into email field
                mmForms.find('[type=email]').val( mmForms.filter(':visible').find('input').first().val() );
                mmForms.toggle();
            })

            /**
              * AJAX handler for Forgot Password
              */
            .on('click', ".forgot-password [type=submit]", function () {
                $.ajax({
                    type: "POST",
                    url: "/Auth/AjaxResetPassword", // TODO Confirm naming convention ( /Auth/AjaxSignIn vs /Auth/LogOut )
                    data: { email: $(".forgot-password [type=email]").val() },
                    success: function (response) {
                        if (response.success) {
                            mmForms.hide();

                            // *** Show the message from the response (default text if response.message is null)
                            var ajaxres = miniModal.find(".ajaxresponse").show().text( response.message || "You should receive an email with instructions to reset your password shortly."),
                                $body = $(document.body);

                            // *** Close the modal after 3.5 seconds
                            setTimeout( function () {
                                $body.trigger("click.close-animated-modal");
                            }, 3500);

                            // *** Hook into "afterclose" event of animated modal
                            $body.one('onAnimatedModalClose', function () {
                                mmForms.first().add(ajaxres).toggle();
                            });
                        } else {
                            alert("We couldn't find a record with that email!");
                        }
                    },
                    dataType: 'json'
                });

                return false;
            });
        });

        $(".logout").on('click', function () {
            $.ajax({
                type: 'POST',
                url: '/Auth/LogOut',
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

        var tagcloudlinks = $(".tagcloud a");
        var sfmenu = $(".sf-menu");

        if (tagcloudlinks) {
            tagcloudlinks.tagcloud({
                color: { start: '#336', end: '#1E3769' }
            });
        }

        // no one can stop me
        if ($.browser.msie && $.browser.version <= 9) {
            $('.loading-bar').wrapInner("<marquee direction=\"right\">")
        }

        $(".mz-site-nav").sitemenu();

    });

});