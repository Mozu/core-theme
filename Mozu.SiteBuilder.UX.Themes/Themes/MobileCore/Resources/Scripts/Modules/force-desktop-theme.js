define(['modules/jquery-plus'], function ($) {
    $(document).ready(function () {
        $('[data-mz-action="forcedesktoptheme"]').on('click', function () {
            $.cookie('SBUSEDESKTOPTHEME', true);
            window.location.reload();
            return false;
        });
    });
});