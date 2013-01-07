define(['jquery', 'shim!vendor/jquery.tagcloud.0-0-1[jquery=jQuery]'], function ($) {

    return $(document).ready(function () {

        var tagcloudlinks = $('[data-mz-role="tagcloud"] a');

        if (tagcloudlinks) {
            tagcloudlinks.tagcloud({
                color: { start: '#336', end: '#1E3769' }
            });
        }

    });

});