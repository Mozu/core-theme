define(['modules/jquery-mozu', 'hyprlive', 'shim!vendor/underscore>_', 'modules/api', 'shim!vendor/bootstrap-affix[jquery=jQuery]', 'shim!vendor/bootstrap-scrollspy[jquery=jQuery]'], function ($, Hypr, _, api) {
    if (!Modernizr.mq('(max-width: 800px)')) {
        var gutterWidth = parseInt(Hypr.getThemeSetting('gutterWidth'));
        $(document).ready(function () {
            $('[data-mz-scrollnav]').each(function () {
                var $this = $(this),
                    $nav = $($this.data('mzScrollnav')),
                    refreshFn = _.debounce(function () {
                        $nav.scrollspy('refresh');
                    }, 500);
                $this.on('click', 'a', function (e) {
                    e.preventDefault();
                    $(this.getAttribute('href')).ScrollTo({ axis: 'y', offsetTop: gutterWidth });
                }).affix({
                    offset: {
                        top: $this.offset().top - gutterWidth,
                        bottom: 0
                    }
                });
                $(window).on('resize', refreshFn);
                api.on('sync', refreshFn);
                api.on('spawn', refreshFn);
                var id = $this.attr('id');
                if (!id) {
                    id = "scrollnav-" + new Date().getTime();
                    $this.attr('id', id);
                }
                $nav.scrollspy({ target: '#' + id, offset: gutterWidth*1.2 });
            });
        });
    }
});
