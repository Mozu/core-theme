(function () {
    function formatMoney(n, decPlaces, thouSeparator, decSeparator, symbol, symbolIsSuffix, roundUp) {
        var sign, i, j, s, om;
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
        om = Math.pow(10, decPlaces);
        symbol = symbol || "$";
        decSeparator = decSeparator == undefined ? "." : decSeparator;
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator;
        sign = n < 0 ? "-" : "";
        i = parseInt(n = (Math.round(om * Math.abs(+n || 0)) / om), 10) + "";
        j = (j = i.length) > 3 ? j % 3 : 0;
            s = (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
        return sign + (symbolIsSuffix ? s + symbol : symbol + s);
    }

    var currencyInfo,
        RoundingTypeConst = {
            UpToCurrencyPrecision: 'upToCurrencyPrecision'
        };
    HyprLive.engine.setFilter('currency', function(num, symbol) {
        if (!currencyInfo) {
            try {
                currencyInfo = HyprLive.engine.options.locals.siteContext.currencyInfo;
            } catch (e) {
                currencyInfo = {
                    symbol: '$',
                    precision: 2,
                    roundingType: 'upToCurrencyPrecision'
                };
            }
        }
        return formatMoney(num, currencyInfo.precision, null, null, symbol || currencyInfo.symbol, false, currencyInfo.roundingType === RoundingTypeConst.UpToCurrencyPrecision);
    });


    HyprLive.engine.setFilter('divisibleby', function (num, divisor) {
        return num && num % divisor === 0;
    });

    HyprLive.engine.setFilter('add_url_param', function (url, param, value) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + encodeURIComponent(param) + '=' + encodeURIComponent(value);
    });

    HyprLive.engine.setFilter('slugify', (function() {
        var trimRE = /^\s+|\s+$/g,
            invalidCharsRE = /[^a-z0-9 -]/g,
            collapseWhitespaceRE = /\s+/g,
            collapseDashRE = /-+/g,
            accentREs = [],
            accentFrom = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;".split(''),
            accentTo = "aaaaeeeeiiiioooouuuunc------".split('');

        for (var i = 0, l = accentFrom.length; i < l; i++) {
            accentREs[i] = new RegExp(accentFrom[i], 'g');
        }

        function string_to_slug(str) {
            str = str.toString().replace(trimRE,'').toLowerCase();

            for (var j=0, k=accentFrom.length ; j<k ; j++) {
                str = str.replace(accentREs[j], accentTo[j]);
            }

            str = str.replace(invalidCharsRE, '-') // remove invalid chars
              .replace(collapseWhitespaceRE, '-') // collapse whitespace and replace by -
              .replace(collapseDashRE, '-'); // collapse dashes

            return str;
        }
        return string_to_slug;
    })());


    HyprLive.engine.setFilter('truncatewords', function (str, num) {
        var words = str.split(' ');
        str = words.slice(0, num).join(' ');
        if (words.length > num) str += " ...";
        return str;
    });

    HyprLive.engine.setFilter('string_format', function (tpt) {
        var formatted = tpt, otherArgs = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, len = otherArgs.length; i < len; i++) {
            formatted = formatted.split('{' + i + '}').join(otherArgs[i]);
        }
        return formatted;
    });

    function prop(o, pn, caseSensitive) {
        if (o) {
            if (caseSensitive) return o[pn];
            pn = pn.toLowerCase();
            for (var k in o) {
                if (pn === k.toLowerCase()) return o[k];
            }
        }
        return '';
    }

    function findWhere(list, k, v, caseSensitive) {
        var length = list.length;
        var o;
        for (var i = 0; i < length; i++) {
            o = prop(list[i], k, caseSensitive);
            if (typeof o !== "undefined" && ((caseSensitive && o === v) || o.toString().toLowerCase() === v.toString().toLowerCase())) return list[i];
        }
    }

    function getProductAttribute(product, attributeName) {
        return findWhere(product.properties.concat(product.options), 'attributeFQN', attributeName);
    }

    HyprLive.engine.setFilter('findwhere', findWhere);

    HyprLive.engine.setFilter('prop', prop);

    HyprLive.engine.setFilter('get_product_attribute', getProductAttribute);

    HyprLive.engine.setFilter('get_product_attribute_value', function(product, attributeName, attributeValue) {
        var attr = getProductAttribute(product, attributeName), values, value;
        if (attr) {
            values = prop(attr, 'values', true);
            if (values) {
                value = values[0];
                return prop(value, 'stringValue', true) || prop(value, 'value', true)
            }
        }
        return '';
    });

}());