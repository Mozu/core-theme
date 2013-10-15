define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/backbone-mozu",], function ($, _, Backbone) {

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'click [data-mz-productimage-thumb]': 'switchImage'
        },
        initialize: function () {
            // preload images
            var imageCache = this.imageCache = {};
            this.$mainImage = this.$('[data-mz-productimage-main]');
            _.each(this.model.get('Content').get('ProductImages'), function (img) {
                var i = new Image();
                i.src = img.ImageUrl + "?size=220";
                imageCache[img.Sequence.toString()] = i;
            });
        },
        switchImage: function (e) {
            var $thumb = $(e.currentTarget),
                seq = $thumb.data('mz-productimage-thumb');
            this.$mainImage.prop('src', this.imageCache[seq].src);
            return false;
        }
    });


    return {
        ProductPageImagesView: ProductPageImagesView
    };

});