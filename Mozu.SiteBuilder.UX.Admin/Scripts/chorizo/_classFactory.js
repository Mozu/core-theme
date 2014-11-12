;
(function($, win, doc) {
    'use strict';

    if (!win.Chorizo) win.Chorizo = {};

    win.Chorizo.classFactory = function(cls, pluginName) {
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

                // First pass, run constructor (no method defined)
                if (!data) $this.data(pluginName, (data = new cls(this, options)));
                
                // Method is defined
                if (typeof option === 'string') {
                    val = data[option].apply(data, Array.prototype.slice.call(args, 1));
                }

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