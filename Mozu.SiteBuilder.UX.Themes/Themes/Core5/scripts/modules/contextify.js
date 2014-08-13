define(['modules/jquery-mozu'], function ($) {
    $(document).ready(function () {
        $('[data-mz-contextify]').each(function () {
            var $this = $(this),
                config = $this.data();

            $this.find(config.mzContextify).each(function () {
                var $item = $(this);
                if (config.mzContextifyAttr === "class") {
                    $item.addClass(config.mzContextifyVal);
                } else {
                    $item.prop(config.mzContextifyAttr, config.mzContextifyVal);
                }
            });
        });
    });
});