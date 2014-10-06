define(['modules/jquery-mozu', 'underscore', 'modules/api', 'modules/backbone-mozu', 'shim!vendor/jquery-colorbox/jquery.colorbox[jquery=jQuery]>jQuery'],
    function ($, _, api, Backbone) {
        $('[data-mz-cms-image]').each(function (index, ci) {
            ci = $(ci);

            var config = ci.data('mzCmsImage'),
                imageUrl = '#';

            if (config && config.imageClickAction === 'lightbox') {
                imageUrl = config.imageSource === 'file' ? '/cms/files/' + config.imageFileId : config.imageExternalUrl;

                ci.click(function (event) {
                    event.preventDefault();

                    $.colorbox({
                        photo: true,
                        href: imageUrl,
                        maxHeight: $(window).height(),
                        maxWidth: $(window).width()
                    });
                });
            }
        });
    }
);