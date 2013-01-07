define(["jquery", "vendor/jquery-colorbox"], function ($) {

    var $mainFigure, $thumbnails, $imageContainer;

    methods = {
        init: function () {
            $imageContainer = $('.mz-product-images');
            $mainFigure = $imageContainer.find('.mz-product-image-main');
            $thumbnails = $imageContainer.find('.mz-product-image-thumb-link');

            $mainFigure.height($mainFigure.find('img').height());

            $thumbnails.mouseenter(function () {
                $mainFigure.empty().append($(this).find('img').clone());
            });

            $imageContainer.find('.mz-product-image-thumb-link').colorbox({
                photo: true
            });
        }
    };

    $(document).ready(methods.init);

    return methods;
});