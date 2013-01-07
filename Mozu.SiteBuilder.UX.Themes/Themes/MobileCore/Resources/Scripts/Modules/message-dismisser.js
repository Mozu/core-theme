define(['modules/jquery-mobileevents'], function ($) {
    $(document).ready(function () {
        $(document.body).on('tap', '.mz-messages ul, .validation-summary-errors ul', function () {
            $(this).css('top', '-100%').delay(500).remove();
        });
    });
});