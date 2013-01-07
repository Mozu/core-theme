define(["jquery", "shim!vendor/jquery-colorbox[jquery=jQuery]"], function ($) {

    var $mainFigure, $thumbnails, $imageContainer;

    methods = {
        init: function () {
            $imageContainer = $('[data-mz-role="productimages-container"]');
            $mainFigure = $imageContainer.find('[data-mz-role="productimages-main"]');
            $thumbnails = $imageContainer.find('[data-mz-role="productimages-link"]');

            $mainFigure.height($mainFigure.find('img').height());

            $thumbnails.mouseenter(function () {
                $mainFigure.empty().append($(this).find('img').clone());
            })
            .colorbox({
                photo: true
            });
        }
    };

    $(document).ready(methods.init);

    return methods;
});