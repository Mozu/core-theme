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

    var decimalPlacesRE = /\.\d+/;

    var MAX_PLACES = 10;

    function getPrecision(num) {
        if (isNaN(num) || (parseInt(num) === num)) return 0;
        var m = num.toString().match(decimalPlacesRE);
        return m && m[0].length || 0;
    }

    function getHighestPrecision(nums) {
        return Math.min(Math.max(nums.reduce(function(highest, num) {
            return Math.max(highest, getPrecision(num));
        }, 0), 2), 15);
    }

    function roundToPrecision(num, precision, down) {
        var c = Math.pow(10, Math.min(precision, MAX_PLACES));
        return Math[down ? ((num < 0) ? "ceil" : "floor") : "round"](c * num) / c;
    }

    function ensureNumeric(fn, forcePrecision) {
        var useForcePrecision = arguments.length === 2;
        return function() {
            var args = Array.prototype.map.call(arguments, Number);
            var precision = useForcePrecision ? forcePrecision : getHighestPrecision(args);
            return roundToPrecision(fn.apply(this, args), precision);
        }
    }


    function MaybeDate(v) {
        // interpret a number or a number string as a seconds value
        var nv = Number(v);
        var d;
        if (isNaN(nv)) {
            d = new Date(v);
        } else {
            if (v instanceof Date) {
                d = v;
            } else {
                d = new Date(v * 1000);
            }
        }
        return (isNaN(+d)) ? null : d;
    }
    function ensureDate(fn) {
        return function() {
            var args = Array.prototype.map.call(arguments, MaybeDate);
            return fn.apply(this, args);
        }
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

    function divide(num, divisor) {
        return num / divisor;
    }

    function add(num, addend) {
        return num + addend;
    }

    function subtract(num, amount) {
        return num - amount;
    }

    function multiply(num, term) {
        return num * term;
    }

    HyprLive.engine.setFilter('divide', ensureNumeric(divide, 14));

    HyprLive.engine.setFilter('add', ensureNumeric(add));

    HyprLive.engine.setFilter('subtract', ensureNumeric(subtract));

    HyprLive.engine.setFilter('multiply', ensureNumeric(multiply, 14));

    HyprLive.engine.setFilter('mod', ensureNumeric(function(num, term) {
        return num % term;
    }));


    function floatFormat(num, places, omitIfRound, roundDown) {
        if ((parseInt(num) === num) && omitIfRound) return num;
        return roundToPrecision(num, places, roundDown).toFixed(places);
    }

    HyprLive.engine.setFilter('floatformat', function(num, placesArg, roundingBehavior) {
        var n = Number(num);
        var places = parseInt(Number(placesArg));
        if (num === '' || isNaN(n)) return '';
        if (placesArg === undefined) places = -1;
        if (isNaN(places)) return num;
        return floatFormat(n, Math.min(Math.abs(places), MAX_PLACES), places < 0, roundingBehavior === "down");
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

    HyprLive.engine.setFilter('urlencode', function(str) {
        return encodeURIComponent(str.toString());
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


    function createAscendingComparator(key) {
        return function(a, b) {
            if (a && b) {
                if (a[key] < b[key]) return -1;
                if (a[key] > b[key]) return 1;
            }
            return 0;
        };
    }

    function createDescendingComparator(key) {
        return function(a, b) {
            if (a && b) {
                if (a[key] > b[key]) return -1;
                if (a[key] < b[key]) return 1;
            }
            return 0;
        };
    }

    function createDictSortFilter(comparator) {
        return function(dictList, key) {
            var sorted = dictList.slice();

            // peek for the proper casing
            key = key.toLowerCase();
            for (var i in sorted[0]) {
                if (sorted[0].hasOwnProperty(i) && i.toLowerCase() === key) {
                    key = i;
                    break;
                }
            }

            sorted.sort(comparator(key));
            return sorted;
        }
    }

    HyprLive.engine.setFilter('dictsort', createDictSortFilter(createAscendingComparator));

    HyprLive.engine.setFilter('dictsortreversed', createDictSortFilter(createDescendingComparator));


    function TimeSpan(date) {
        if (!(this instanceof TimeSpan)) return new TimeSpan(date);
        var totalSeconds = date < 0 ? 0 : date / 1000;
        this.TotalDays = totalSeconds / 86400;
        this.Days = Math.floor(this.TotalDays);
        this.TotalHours = totalSeconds / 3600;
        this.Hours = Math.floor(this.TotalHours) % 24;
        this.TotalMinutes = totalSeconds / 60;
        this.Minutes = Math.floor(this.TotalMinutes) % 60;
    }

    function printDatePart(total, value, denom) {
        if (total < 1) return "";
        return value + " " + denom + (value !== 1 ? "s" : "");
    }

    function getPart(timespan, daysLeft, divider) {
        return {
            total: timespan.Days / divider,
            rounded: Math.floor(daysLeft / divider),
            remaining: daysLeft % divider
        };
    }

    function toHumanDate(memo, datePart) {
        if (memo.elemsCount == 2) return memo;
        var strPart = printDatePart(datePart.total, datePart.rounded, datePart.denom);
        var elemsCount = memo.elemsCount;
        var space = "";
        if (strPart) {
            elemsCount = elemsCount + 1;
            if (memo.humanized) {
                space = " ";
            }
        }
        return {
            humanized: memo.humanized + space + strPart,
            elemsCount: elemsCount
        };
    };

    function timeBetween(date, laterDate) {
        if (!date || !laterDate) return "0 minutes";
        var timespan = TimeSpan(laterDate - date);

        var yearPart = getPart(timespan, timespan.Days, 365);
        yearPart.denom = "year";
        var monthPart = getPart(timespan, yearPart.remaining, 30);
        monthPart.denom = "month";
        var weekPart = getPart(timespan, monthPart.remaining, 7);
        weekPart.denom = "week";

        var parts = [
            yearPart,
            monthPart,
            weekPart,
            {
                total: timespan.TotalDays,
                rounded: timespan.Days % 7,
                denom: "day"
            },
            {
                total: timespan.TotalHours,
                rounded: timespan.Hours,
                denom: "hour"
            },
            {
                total: timespan.TotalMinutes,
                rounded: timespan.Minutes,
                denom: "minute"
            }
        ];

        var resultDate = parts.reduce(toHumanDate, {
            humanized: "",
            elemsCount: 0
        });
        if (resultDate.elemsCount === 0) return "0 minutes";
        return resultDate.humanized;
    }

    HyprLive.engine.setFilter('timeuntil', ensureDate(function(value, laterDate) {
        return timeBetween(value, laterDate);
    }));

    HyprLive.engine.setFilter('timesince', ensureDate(function(value, laterDate) {
        return timeBetween(laterDate, value);
    }));

    HyprLive.engine.setFilter('is_after', ensureDate(function(value, date) {
        return value > date;
    }));

    HyprLive.engine.setFilter('is_before', ensureDate(function(value, date) {
        return date > value;
    }));

    HyprLive.engine.setFilter('parse_date', function(value) {
        if (typeof value === "string" || typeof value === "number") {
            var n = Number(value);
            if (!isNaN(n)) return n;
        }
        return (new Date(value))/1000;
    });

    HyprLive.engine.setFilter('add_time', function(value, moreTime) {
        value = MaybeDate(value);
        moreTime = parseInt(moreTime);
        if (!value) return "";
        if (!moreTime || isNaN(moreTime)) return value;
        return ((+value) + (moreTime*1000))/1000;
    });

    HyprLive.engine.setFilter('split', function(value, separator) {
        var sepType = typeof separator;
        var valType = typeof value;
        if (separator && sepType !== "string" && sepType !== "number") {
            throw new Error("Must supply a string or number as the separator to the |split filter.");
        }
        if (value && valType !== "string" && valType !== "number") {
            throw new Error("Must supply a string or number as the value to the |split filter.");
        }
        try {
            return value.toString().split(arguments.length === 2 ? separator.toString() : " ");
        } catch (e) {
            throw new Error("Error in |split filter: " + e);
        }
    });

    HyprLive.engine.setFilter('replace', function(value, toReplace, replacement) {
        var toReplaceType = typeof toReplace;
        var replacementType = typeof replacement;
        var valType = typeof value;
        if (value && valType !== "string" && valType !== "number") {
            throw new Error("Must supply a string or number as the value to the |replace filter.");
        }
        if (arguments.length === 1) {
            throw new Error("Must call |replace filter with at least one argument.");
        }
        if (toReplace && toReplaceType !== "string" && toReplaceType !== "number") {
            throw new Error("Must supply a string or number as the string to replace argument to the |replace filter.");
        }
        if (replacement && replacementType !== "string" && replacementType !== "number") {
            throw new Error("Must supply a string or number as the second argument to the |split filter.");
        }
        try {
            return value.toString().split(toReplace.toString()).join(replacement ? replacement.toString() : '');
        } catch (e) {
            throw new Error("Error in |replace filter: " + e);
        }
    });


}());