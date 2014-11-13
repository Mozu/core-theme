define(['modules/jquery-mozu', 'underscore', 'modules/api', 'modules/backbone-mozu', 'shim!vendor/jquery-colorbox/jquery.colorbox[jquery=jQuery]>jQuery'],
    function ($, _, api, Backbone) {
        $('[data-mz-cms-image]').each(function (index, ci) {
            ci = $(ci);

            var config = ci.data('mzCmsImage'),
                imageUrl = '#';

            if (config && config.imageClickAction === 'lightbox') {
                imageUrl = config.imageSource === 'file' ? '/cms/files/' + config.imageFileId : config.imageExternalUrl;

                ci.on('click', function (event) {
                    event.preventDefault();

                    if (!require.mozuData('pagecontext').isEditMode) {

                        $.colorbox({
                            photo: true,
                            href: imageUrl,
                            maxHeight: $(window).height() - 200,
                            maxWidth: $(window).width() - 200,
                            scrolling: false,
                            opacity: '0.7',
                            scalePhotos: true,
                            transition: 'none',
                            onComplete: function() {
                                $('#cboxClose').html('<span style="display: inline-block">X</span>');
                            }
                        });
                        
                    }

                });
            }
        });
    }
);