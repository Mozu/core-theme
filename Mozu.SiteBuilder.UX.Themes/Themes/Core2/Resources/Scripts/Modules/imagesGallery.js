define(["jquery","vendor/jquery-colorbox","vendor/jquery-slider"], function ($) {

    var $mainFigure, $thumbnails, $imageContainer;

    methods = {
        init: function () {
            $('.image-gallery.carousel, .image-gallery.slider').each(function () {
                var $carousel = $(this),
                    autoplay = $carousel.attr('data-autoplay') === 'on',
                    delay = ($carousel.attr('data-delay') || 4) * 1000,
                    isSlider = $carousel.hasClass('slider'),
                    size = isSlider ? 100 : 400,
                    sliderColumns = $carousel.attr('data-slider-columns');
                
                $carousel.find('.carousel-wrapper').bjqs({
                    animspeed: delay,
                    automatic: autoplay,
                    animtype: 'slide',
                    height: size,
                    width: size,
                    showmarkers: false
                });


                $carousel.find('.carousel-wrapper').css('width', size * sliderColumns);
                $carousel.find('.bjqs-wrapper').css('width', size * sliderColumns); 

            });

            $('.image-gallery.grid[data-lightbox="on"] a').colorbox({
                photo: true
            });
        }
    };

    $(document).ready(methods.init);
});