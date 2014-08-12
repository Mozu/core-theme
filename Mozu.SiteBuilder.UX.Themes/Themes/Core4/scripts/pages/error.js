require(["jquery"], function ($) {
    $('.mz-errordetail-expander').click(function() {
        $(this).toggleClass('is-expanded')
        .next().toggleClass('is-expanded');
    })
});
