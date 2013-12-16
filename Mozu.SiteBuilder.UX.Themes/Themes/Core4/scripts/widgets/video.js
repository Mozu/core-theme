define(['modules/jquery-mozu', '//www.youtube.com/iframe_api'],
    function($) {
        var parseId,
            bind;



        parseId = function(url) {
            var expr = /(youtu\.be\/|[?&]v=)([^&]+)/,
                match = url.match(expr);

            if (match && match[2]) return match[2];
        };

        bind = function() {
            var $this = $(this),
                url = $this.data('url'),
                id = parseId(url),
                address,
                player,
                $button,
                $player,
                $cover;

            if (!id && this.data('id')) return;

            $this.data('id', id);

            address = '\'http://img.youtube.com/vi/' + id + '/maxresdefault.jpg\'';

            $cover = $this.find('.mz-cms-video-cover').css({
                'background-image': 'url(' + address + ')',
                opacity: 1
            });

            $player = $this.find('.mz-cms-video-player').attr('id', 'youtube-player-' + id);

            player = new YT.Player('youtube-player-' + id, {
                height: '100%',
                width: '100%',
                videoId: id
            });

            if ($this.data('edit')) return;
            
            $button = $this.find('.mz-cms-video-play').on('click', function() {
                $player = $this.find('.mz-cms-video-player').css({
                    opacity: 1,
                });

                $button.css('opacity', 0);
                $cover.css('opacity', 0);

                setTimeout(function() {
                    $player.css('z-index', 10);
                }, 2200);

                player.playVideo();
            })
        };

        $(document).ready(function() {
            $('.mz-cms-video-placeholder').each(bind);
    
            $(document).on('mozuwidgetdrop', function(e) {
                $(e.currentTarget).find('.mz-cms-video-placeholder').each(bind)
            })
        });
    }
);