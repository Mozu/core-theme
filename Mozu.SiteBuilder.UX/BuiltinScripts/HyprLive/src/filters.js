(function () {
    function formatMoney(n, decPlaces, thouSeparator, decSeparator, symbol, symbolIsSuffix) {
        var decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
            symbol = symbol || "$",
            decSeparator = decSeparator == undefined ? "." : decSeparator,
            thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
            sign = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0,
            s = (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
        return sign + (symbolIsSuffix ? s + symbol : symbol + s);
    }

    HyprLive.engine.setFilter('currency', function (num, symbol) {
        return formatMoney(num);
    });


    HyprLive.engine.setFilter('divisibleby', function (num, divisor) {
        return num % divisor === 0;
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

            str = str.replace(invalidCharsRE, '') // remove invalid chars
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
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, len = otherArgs.length; i < len; i++) {
            tpt.split('{' + i + '}').join(otherArgs[i]);
        }
        return tpt;
    });

}());