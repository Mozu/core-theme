define(['modules/jquery-mozu', 'shim!vendor/underscore>_', 'modules/api', 'modules/backbone-mozu', 'shim!vendor/jquery.colorbox-min[jquery=jQuery]>jQuery'],
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
                        html: ['<img src="', imageUrl, '"</img>'].join('')
                    });
                });
            }
        });
    }
);