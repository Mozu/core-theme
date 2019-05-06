define(["modules/jquery-mozu"], function ($) {

    var Dropdown = function(){
        var onSelect = function(e, value){

        };

        return {
            init: function (options) {
                options = options || {};
                var selector = options.selector || '.dropdown';

                onSelect = options.onSelect || onSelect;
                
                $(selector).click(function () {
                    $(this).attr('tabindex', 1).focus();
                    $(this).toggleClass('active');
                    $(this).find('.dropdown-menu').slideToggle(100);
                });

                $(selector).focusout(function () {
                    $(this).removeClass('active');
                    $(this).find('.dropdown-menu').slideUp(100);
                });

                $(selector + ' .dropdown-menu li').click(function (e) {
                    //$(this).parents('.dropdown').find('span').text($(this).text());
                    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
                    onSelect(e, $(this).attr('id'));
                }); 
            }
        };
    };

    return Dropdown();
});