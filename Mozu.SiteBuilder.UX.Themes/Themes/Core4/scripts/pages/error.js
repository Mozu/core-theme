require(["jquery"], function ($) {
    $('#mz-error-detail-link').click(function() {
        $('#mz-error-detail-link').toggleClass('mz-expanded');
        $('#mz-error-detail').toggleClass('mz-expanded');
    })
});
