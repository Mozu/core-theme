;
(function($, win, doc) {
    'use strict';

    if (!$.mozu) $.mozu = {};

    $.mozu.classFactory = function(cls, pluginName) {
        var split = pluginName.split('.'),
            namespace = split[0],
            name = split[1],
            old;

        old = $.fn[name];

        $.fn[name] = function(option) {
            var args = arguments,
                ret;
            
            this.each(function() {
                var $this = $(this),
                    data = $this.data(pluginName),
                    options = typeof option === 'object' && option,
                    val;

                if (!data) $this.data(pluginName, (data = new cls(this, options)));
                if (typeof option === 'string') val = data[option].apply(data, Array.prototype.slice.call(args, 1));

                if (typeof val !== 'undefined' && val !== $this) {
                    ret = val;
                    return false;
                }
            });

            return ret || this;
        }

        $.fn[name].noConflict = function() {
            $.fn[name] = old;
            return this;
        }
    }
}(jQuery, window, document))