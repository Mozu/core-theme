define(['modules/jquery-mozu', 'hyprlive', 'shim!vendor/bootstrap-affix[jquery=jQuery]', 'shim!vendor/bootstrap-scrollspy[jquery=jQuery]'], function ($, Hypr) {
    var gutterWidth = parseInt(Hypr.getThemeSetting('gutterWidth'));
    $(document).ready(function () {
        $('[data-mz-scrollnav]').each(function () {
            var $this = $(this);
            $this.on('click', 'a', function (e) {
                    e.preventDefault();
                    $(this.getAttribute('href')).ScrollTo({ axis: 'y', offsetTop: gutterWidth });
                }).affix({
                    offset: {
                        top: $this.offset().top - gutterWidth,
                        bottom: 0
                    }
                });
            var id = $this.attr('id');
            if (!id) {
                id = "scrollnav-" + new Date().getTime();
                $this.attr('id', id);
            }
            $($this.data('mzScrollnav')).scrollspy({ target: '#' + id, offset: gutterWidth*1.2 });
        });
    });
});
