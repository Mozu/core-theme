define(['modules/jquery-mozu', 'underscore', "modules/backbone-mozu", 'hyprlive'], function ($, _, Backbone, Hypr) {

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'click [data-mz-productimage-thumb]': 'switchImage'
        },
        initialize: function () {
            // preload images
            var self = this;
            self.model.on("change:productImages", function(model, images){
                self.clearImageCache();
                self.initImages(self.model.get('productImages'));
                self.render();
                if(images.length) {
                    self.selectedImageIx = images[0].sequence;
                    self.updateMainImage();
                }
                
            });
            self.initImages();
        },
        initImages: function(images){
            var imageCache = this.imageCache = {},
                cacheKey = Hypr.engine.options.locals.siteContext.generalSettings.cdnCacheBustKey;
                
                images = images || [];

                if(!images.length) {
                    images = this.model.get('content').get('productImages');
                }

            _.each(images, function (img) {
                var i = new Image();
                i.src = img.imageUrl + '?max=' + Hypr.getThemeSetting('productImagesContainerWidth') + '&_mzCb=' + cacheKey;
                if (img.altText) {
                    i.alt = img.altText;
                    i.title = img.altText;
                }
                imageCache[img.sequence.toString()] = i;
            });
        },
        clearImageCache: function(){
            this.imageCache = {};
        },
        switchImage: function (e) {
            var $thumb = $(e.currentTarget);
            this.selectedImageIx = $thumb.data('mz-productimage-thumb');
            this.updateMainImage();
            return false;
        },
        updateMainImage: function () {
            if (this.imageCache[this.selectedImageIx]) {
                this.$('[data-mz-productimage-main]')
                    .prop('src', this.imageCache[this.selectedImageIx].src)
                    .prop('title', this.imageCache[this.selectedImageIx].title)
                    .prop('alt', this.imageCache[this.selectedImageIx].alt);
            }
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.updateMainImage();
        }
    });


    return {
        ProductPageImagesView: ProductPageImagesView
    };

});