define(["jquery"], function ($) {

    $(document).ready(function () {
        $('body').append('<div id="fb-root"></div>');

        // add some responsiveness to facebook tools
        $('.fb-comments').each(function () {
            var $t = $(this);
            $t.attr('data-width', $t.innerWidth());
        });

        window.fbAsyncInit = function () {
            FB.init({
                appId: '364096256972277', // App ID
                //channelUrl: '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
                status: true, // check login status
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true  // parse XFBML
            });
        };

        // Load the SDK Asynchronously
        (function (d) {
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);
        } (document));
    });

});