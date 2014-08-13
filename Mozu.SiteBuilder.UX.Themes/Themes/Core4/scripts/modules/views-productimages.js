define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/backbone-mozu", 'hyprlive'], function ($, _, Backbone, Hypr) {

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'click [data-mz-productimage-thumb]': 'switchImage'
        },
        initialize: function () {
            // preload images
            var imageCache = this.imageCache = {};
            _.each(this.model.get('content').get('productImages'), function (img) {
                var i = new Image();
                i.src = img.imageUrl + "?max=" + Hypr.getThemeSetting('productImagesContainerWidth');
                imageCache[img.sequence.toString()] = i;
            });
        },
        switchImage: function (e) {
            var $thumb = $(e.currentTarget);
            this.selectedImageIx = $thumb.data('mz-productimage-thumb');
            this.updateMainImage();
            return false;
        },
        updateMainImage: function () {
            if (this.imageCache[this.selectedImageIx]) {
                this.$('[data-mz-productimage-main]').prop('src', this.imageCache[this.selectedImageIx].src);
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