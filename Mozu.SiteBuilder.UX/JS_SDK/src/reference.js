// BEGIN REFERENCE
var ApiReference = (function () {

    var urlShortcuts = {
        'products': 'mozu.ProductRuntime.WebApi/products',
        'productsearch': {
            template: 'mozu.ProductRuntime.WebApi/productsearch{?_*}',
            shortcutParam: 'q',
            defaults: {

            }
        },
        'product': {
            template: 'mozu.ProductRuntime.WebApi/products/{productCode}',
            shortcutParam: 'productCode'
        }
    };

    return {

        getUrlFor: function(operation, shortcutName, conf, context) {
            var shortcut = urlShortcuts[shortcutName];
            if (!shortcut) return shortcutName;
            if (shortcut[operation]) shortcut = shortcut[operation];
            if (!shortcut) throw "No known URL for '" + shortcutName + "' type.";
            if (typeof shortcut === "string") return shortcut;
            if (shortcut.template) {
                // cache templates lazily
                if (typeof shortcut.template === "string") shortcut.template = utils.uritemplate.parse(shortcut.template);
                var tptData = {
                    _: conf
                };
                if (typeof conf === "string") {
                    if (!shortcut.shortcutParam) throw "No shortcut parameter available for '" + shortcutName + "'. Please supply a configuration object instead of '" + conf + "'.";
                    tptData[shortcut.shortcutParam] = conf;
                } else if (conf) {
                    utils.extend(tptData, conf.query || conf);
                }
                if (shortcut.defaults) tptData = utils.extend({}, shortcut.defaults, tptData);
                return shortcut.template.expand(tptData);
            }

            throw "URLs beyond simple strings and templates are not implemented."

        },

        createRichObjectFor: function (typeName, typeInfo) {

        }

    };

}());
// END REFERENCE

/***********/