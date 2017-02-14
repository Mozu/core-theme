 (function(root) {	/* IE8 polyfills */	var hasOwnProperty = Object.prototype.hasOwnProperty,
    hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
    dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable'
    ],
    dontEnumsLength = dontEnums.length;	(function() {
    var _slice = Array.prototype.slice;

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
        Array.prototype.slice = function(begin, end) {
            var i, arrl = this.length,
            a = [];
            // Although IE < 9 does not fail when applying Array.prototype.slice
            // to strings, here we do have to duck-type to avoid failing
            // with IE < 9's lack of support for string indexes
            if (this.charAt) {
                for (i = 0; i < arrl; i++) {
                    a.push(this.charAt(i));
                }
            }
            // This will work for genuine arrays, array-like objects, 
            // NamedNodeMap (attributes, entities, notations),
            // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
            // and will not fail on other DOM objects (as do DOM elements in IE < 9)
            else {
                // IE < 9 (at least IE < 9 mode in IE 10) does not work with
                // node.attributes (NamedNodeMap) without a dynamically checked length here
                for (i = 0; i < this.length; i++) {
                    a.push(this[i]);
                }
            }
            // IE < 9 gives errors here if end is allowed as undefined
            // (as opposed to just missing) so we default ourselves
            return _slice.call(a, begin, end || a.length);
        };
    }
}());
(function() {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    if (!Array.prototype.some) {
        Array.prototype.some = function(fun /*, thisArg */ ) {
            'use strict';

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function')
                throw new TypeError();

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(thisArg, t[i], i, t))
                    return true;
            }

            return false;
        };
    }
    if (!Array.prototype.map) {
        Array.prototype.map = function(fun /*, thisArg */ ) {
            "use strict";

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var res = new Array(len);
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                // NOTE: Absolute correctness would demand Object.defineProperty
                //       be used.  But this method is fairly new, and failure is
                //       possible only if Object.prototype or Array.prototype
                //       has a property |i| (very unlikely), so use a less-correct
                //       but more portable alternative.
                if (i in t)
                    res[i] = fun.call(thisArg, t[i], i, t);
            }

            return res;
        };
    }
    if (!Array.prototype.every) {
        Array.prototype.every = function(fun /*, thisArg */ ) {
            'use strict';

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function')
                throw new TypeError();

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && !fun.call(thisArg, t[i], i, t))
                    return false;
            }

            return true;
        };
    }
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /*, thisArg */ ) {
            "use strict";

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t)
                    fun.call(thisArg, t[i], i, t);
            }
        };
    }
})();
(function() {
    if (!Object.create) {
        Object.create = (function() {
            function F() {}

            return function(o) {
                if (arguments.length != 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o
                return new F()
            }
        })();
    }
    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';

            return function (obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
    if(!Array.isArray) {
        Array.isArray = function (vArg) {
            var isArray;

            isArray = vArg instanceof Array;

            return isArray;
        };
    }
    var split;

// Avoid running twice; that would break the `nativeSplit` reference
    split = split || function (undef) {

        var nativeSplit = String.prototype.split,
        compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
        self;

        self = function (str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [],
            flags = (separator.ignoreCase ? "i" : "") +
                (separator.multiline  ? "m" : "") +
                (separator.extended   ? "x" : "") + // Proposed for ES6
                (separator.sticky     ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
            // Make `global` and avoid `lastIndex` issues by working with a copy
            separator = new RegExp(separator.source, flags + "g"),
            separator2, match, lastIndex, lastLength;
            str += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === undef ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0; // ToUint32(limit)
                while (match = separator.exec(str)) {
                    // `separator.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        output.push(str.slice(lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            match[0].replace(separator2, function () {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (arguments[i] === undef) {
                                        match[i] = undef;
                                    }
                                }
                            });
                        }
                        if (match.length > 1 && match.index < str.length) {
                            Array.prototype.push.apply(output, match.slice(1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= limit) {
                            break;
                        }
                    }
                    if (separator.lastIndex === match.index) {
                        separator.lastIndex++; // Avoid an infinite loop
                    }
                }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
        // For convenience
        String.prototype.split = function (separator, limit) {
            return self(this, separator, limit);
        };

        return self;
    }();
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            if ( this === undefined || this === null ) {
                throw new TypeError( '"this" is null or not defined' );
            }

            var length = this.length >>> 0; // Hack to convert object.length to a UInt32

            fromIndex = +fromIndex || 0;

            if (Math.abs(fromIndex) === Infinity) {
                fromIndex = 0;
            }

            if (fromIndex < 0) {
                fromIndex += length;
                if (fromIndex < 0) {
                    fromIndex = 0;
                }
            }

            for (;fromIndex < length; fromIndex++) {
                if (this[fromIndex] === searchElement) {
                    return fromIndex;
                }
            }

            return -1;
        };
    }

	if ( !Date.prototype.toISOString ) {         
		(function() {         
			function pad(number) {
				var r = String(number);
				if ( r.length === 1 ) {
					r = '0' + r;
				}
				return r;
			}      
			Date.prototype.toISOString = function() {
				return this.getUTCFullYear()
					+ '-' + pad( this.getUTCMonth() + 1 )
					+ '-' + pad( this.getUTCDate() )
					+ 'T' + pad( this.getUTCHours() )
					+ ':' + pad( this.getUTCMinutes() )
					+ ':' + pad( this.getUTCSeconds() )
					+ '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
					+ 'Z';
			};       
		}() );
	}


})();	// the definewrapper.tpl uses a super-slim override of "define" that pushes AMD deps into an array.
    // this allows us to cleanly vendor AMD-compatible scripts without polluting scope or registering 
    // private scripts in the root require namespace.
    // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
	var amds = [],
	internalDefine = function() {
        var fac = [].pop.apply(arguments);
        amds.push(typeof fac == "function" ? fac() : fac);
	};
	internalDefine.amd = {};
    // only while this library is evaluating, let's replace window.define
    var externalDefine = root.define;
    var define = root.define = internalDefine;
	(function (exportFn) {
		exportFn(['hyprlivecontext'], function (HyprLiveContext) {
            
var HyprLiveTemplate = function (precompiledTpl, path) {
    this.precompiledTpl = precompiledTpl;
    this.path = path;
},

    compiled = {},
    getHyprLiveTemplate = function (path) {
        var lpath = path.toLowerCase(),
            tptText = HyprLiveContext.templates[lpath];
        if (!tptText) throw new ReferenceError("HyprLive template \"" + lpath + "\" not found!");
        if (!(lpath in compiled)) {
            compiled[lpath] = new HyprLiveTemplate(HyprLive.engine.precompile(tptText, {
                filename: path
            }), path);
        }
        return compiled[lpath];
    };

HyprLiveTemplate.prototype = {
    render: function (obj) {
        HyprLive.immanentize();
        return HyprLive.engine.run(this.precompiledTpl.tpl, obj, this.path);
    }
}
// BEGIN INIT
/*global HyprLiveContext:true, amds:true , getHyprLiveTemplate:true*/



function formatString(str, arr) {
    var formatted = str, otherArgs = arr;
    for (var i = 0, len = otherArgs.length; i < len; i++) {
        formatted = formatted.split('{' + i + '}').join(otherArgs[i] || '');
    }
    return formatted;
}

function deparam(querystring) {
    // remove any preceding url and split
    querystring = querystring || window.location.search;
    querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
    var params = {}, pair, d = decodeURIComponent, i;
    // march and parse
    for (i = querystring.length; i > 0;) {
        pair = querystring[--i].split('=');
        params[d(pair[0])] = d(pair[1]);
    }

    return params;
}//--  fn  deparam


HyprLiveContext = HyprLiveContext || {
    locals: {},
    templates: {}
};

//if (!HyprLiveContext) throw new ReferenceError("If no AMD loader is present, there must be a global variable named HyprLiveContext for HyprLive to function.");
//HyprLiveContext = JSON.parse(HyprLiveContext);

var locals = HyprLiveContext.locals,
    volatilelocalNames = ['pageContext', 'user']; // 'navigation'];



for (var lni = 0, llen = volatilelocalNames.length; lni < llen; lni++) {
    locals[volatilelocalNames[lni]] = require.mozuData(volatilelocalNames[lni].toLowerCase());
    //if (!locals[volatilelocalNames[lni]]) throw new ReferenceError('This page template fails to preload the ' + volatilelocalNames[lni] + ' global using {% preload_json ' + volatilelocalNames[lni] + ' "' + volatilelocalNames[lni].toLowerCase() + '" %}');
}

locals.now = require.mozuData('now') || (new Date()).toISOString();

var HyprLive = {
    engine: new amds[0].Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}'],
        inlineCmtControls: ['{#', '#}'],
        locals: locals,
        loader: amds[0].loaders.memory(HyprLiveContext.templates, '/')
    }),
    getTemplate: getHyprLiveTemplate,
    getThemeSetting: function(setting) {
        return locals.themeSettings[setting];
    },
    getLabel: function (name) {
        if (arguments.length === 1) {
            return locals.labels[name];
        }
        if (arguments.length > 1) {
            return formatString(locals.labels[name], Array.prototype.slice.call(arguments, 1));
        }
    },
    immanentize: function () {
        if (locals.pageContext) {
            locals.pageContext.query = deparam();
        }
    }


};
HyprLive.immanentize();
// END INIT
//function NullTags() {
//    this.tags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];

//    this.parse = function () {
//        return null;
//    }
//}

//HyprLive.addExtension('NullTags', new NullTags());


var nullParse = function() {
        return true;
    },
    nullCompile = function() {
        return '';
    };

var nullTags = ['require_script', 'json_attribute', 'data_attributes'];
for (var t = 0; t < nullTags.length; t++) {
    HyprLive.engine.setTag(nullTags[t], nullParse, nullCompile, false, true);
}

HyprLive.engine.setTag("comment", function(str, line, parser, types) {
    parser.on('*', function(token) {
        throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
    });

    return true;
}, function() {
    return ''
}, true);



var DumpTag = {
    emitter: [
        ";(function(v, n) { ",
        "_output += \"<pre class=\\\"hypr-dump\\\"><code>\"; ",
        "_output += Object.prototype.toString.call(v) + n; ",
        "if (typeof v === 'object') { ",
        "try { ",
        "_output += _filters.e(JSON.stringify(v, null, 2)) + n; ",
        "} catch(e) { _output += \"Error: Could not serialize.\" + n; } ",
        "} else { ",
        "_output += _filters.e(v) + n; ",
        "} ",
        "_output += \"</code></pre>\"; ",
        "}({0}, \"\\n\"));"
    ].join('').split('{0}'),
    parse: function(str, line, parser, types) {
        parser.on(types.VAR, function() {
            return true;
        });
        return true;
    },
    compile: function(compiler, args) {
        var o = '';
        for (var i = 0, l = args.length; i < l; i++) {
            o += DumpTag.emitter.join(args[i]);
        }
        return o;
    }
};
HyprLive.engine.setTag("dump", DumpTag.parse, DumpTag.compile);


var WithTag = {
    as: 'as',
    asError: 'The {% with %} tag requires the token "as" to appear once and only once.',
    parse: function(str, line, parser, types) {
        var asEncountered = false;
        parser.on('*', function(token) {
            if (!asEncountered) return true;
        });
        parser.on(types.VAR, function(token) {
            if (token.match === WithTag.as) {
                if (asEncountered) throw new Error("Error on line " + line + ": " + WithTag.asError);
                asEncountered = true;
                return false;
            } else if (this.prevToken && this.prevToken.match === WithTag.as) {
                this.out.push(token.match);
            } else {
                return true;
            }
        });
        parser.on('end', function() {
            if (!asEncountered) throw new Error("Error on line " + line + ": " + WithTag.asError)
        });
        return true;
    },
    compile: function(compiler, args, content, parents, options) {
        var localVar = args.pop();
        return "\n(function(" + localVar + "){\n" + compiler(content, parents, options) + ";\n})(" + args.join('') + ");\n";
    }
};
HyprLive.engine.setTag('with', WithTag.parse, WithTag.compile, true, false);

var DropZoneTag = {
    format: [
        "\n_output += \"<div id=\\\"mz-drop-zone-", "\\\" class=\\\"mz-drop-zone\\\"></div>\";"
    ],
    parse: function(str, line, parser, types) {
        var named = false;
        parser.on(types.STRING, function(token) {
            if (!named) {
                this.out.push(token.match);
                named = true;
                return true;
            }
            return false;
        });
        return true;
    },
    compile: function(compiler, args, content, parents, options) {
        var dropzoneName = args.shift();
        return DropZoneTag.format.join(dropzoneName.substring(1, dropzoneName.length - 1));
    }
};
HyprLive.engine.setTag('dropzone', DropZoneTag.parse, DropZoneTag.compile, false, false);

var MakeUrlTag = {
    parse: function(str, line, parser, types) {
        var withEncountered = false,
            asEncountered = false,
            key;

        parser.on(types.VAR, function(token) {
            if (token.match === 'with') {
                withEncountered = true;
                return false;
            }
            if (token.match === 'as_parameter') {
                asEncountered = true;
                return false;
            }
            if (withEncountered && !asEncountered) {
                if (!key) {
                    key = true;
                    this.out.push('"' + token.match + '"');
                    return false;
                } else {
                    key = false;
                }
                return true;
            }
            return true;
        });


        return true;
    },
    compile: function(compiler, args, content, parents, options, blockName) {
        return '_output += _ext.makeUrlTag(' + args + ');';
    }
};

HyprLive.engine.setExtension('makeUrlTag', function(type, object) {
    var params = Array.prototype.slice.call(arguments, 2),
        query = '?',
        fnName = type + 'Url',
        secondArg;

    for (var i = 0; i < params.length; i++) {
        if (type === 'paging' && params[i-1] === 'page') {
            secondArg = params[i];
        } else if (type === 'product' && params[i-1] === 'variant') {
            secondArg = params[i];
        } else if ((type !== 'paging' && type !== 'product') || (params[i] !== 'page' && params[i] !== 'variant')) {
            query += (i % 2 ? '=' : '&') + encodeURI(params[i]);
        }
    }

    if (typeof util[fnName] === 'function') {
        return util[fnName](object, query, secondArg);
    }

    return '#';
});

var util = {
    sortingKey: 'sortBy',
    facetKey: 'facetValueFilter',
    pagingKey: 'startIndex',
    imageUrl: function(object, extendedQuery) {
        var url = typeof object === 'object' ? object.imageUrl : object;
        return this.urlScrub(url + extendedQuery + this.getCdnCacheBust());
    },
    productUrl: function(object, extendedQuery, variant) {
        var code = typeof object === 'object' ? object.productCode : object;
        if (!variant) {
            return this.urlScrub('/p/' + code + extendedQuery);
        }
        return this.urlScrub('/p/' + code + '/v/' + variant + extendedQuery);
    },
    categoryUrl: function(object, extendedQuery) {
        var code = typeof object === 'object' ? object.categoryCode : object;
        return this.urlScrub('/c/' + code + extendedQuery);
    },
    sortingUrl: function(object, extendedQuery) {
        var query = this.parseQuery();
        query[this.sortingKey] = object;
        return this.urlScrub(extendedQuery + '&' + this.stringify(query));
    },
    facetUrl: function(object, extendedQuery) {
        var filterValue = typeof object === 'object' ? object.filterValue : object,
            query = this.parseQuery(),
            filters = !query[this.facetKey] ? [] : query[this.facetKey].split(','),
            idx = this.indexOf(filters, filterValue);

        if (idx === -1) {
            filters.push(filterValue);
        } else {
            filters.splice(idx, 1);
        }

        query[this.facetKey] = filters.join(',');

        return this.urlScrub(extendedQuery + '&' + this.stringify(query));
    },
    cdnUrl: function(object, extendedQuery) {
        var url = object + extendedQuery + this.getCdnCacheBust();
        return this.urlScrub(HyprLiveContext.locals.siteContext.cdnPrefix + url);
    },
    pagingUrl: function(object, extendedQuery, page) {
        var startIndex = 0,
            query = this.parseQuery(),
            max = Math.floor(object.totalCount / object.pageSize) * object.pageSize;

        if (typeof page === 'undefined') {
            page = object.startIndex / object.pageSize + 1;
        }

        switch(page) {
            case 'first':
                startIndex = 0;
                break;
            case 'last':
                startIndex = max;
                break;
            case 'previous':
                startIndex = object.startIndex - object.pageSize;
                break;
            case 'next':
                startIndex = object.startIndex + object.pageSize;
                break;

            default:
                page = parseInt(page);
                if (typeof page === 'number' && !isNaN(page)) {
                    startIndex = (page - 1) * object.pageSize;
                }
        }

        if (startIndex < 0) {
            startIndex = 0;
        } else if (startIndex > max) {
            startIndex = max;
        }

        query[this.pagingKey] = startIndex;

        return this.urlScrub(extendedQuery + '&' + this.stringify(query));
    },
    indexOf: function(arr, item) {
        if (Array.prototype.indexOf) {
            return arr.indexOf(item);
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
        return  -1;
    },
    map: function(arr, fn) {
        if (Array.prototype.map) {
            return arr.map(fn);
        }
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            ret.push(fn(arr[i], i));
        }
        return ret;
    },
    parseQuery: function(str) {
        var ret = this.map((str || window.location.search).replace(/(^\?)/, '').split('&'), function(n) {
            return n = n.split('='), this[decodeURIComponent(n[0])] = decodeURIComponent(n[1]), this;
        }.bind({}))[0];
        delete ret[''];
        return ret;
    },
    stringify: function(obj) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }

        return str.join('&');
    },
    getCdnCacheBust: function() {
        return '&_mzCb=' + HyprLiveContext.locals.siteContext.generalSettings.cdnCacheBustKey;
    },
    urlScrub: function(url) {
        var stem = url.replace(/(&$)|(\?$)/g, '').replace(/\?&/, '?').replace(/&+/g, '&');
        if ( stem.length > 0 && stem[0] === '/')
        {
            stem = HyprLiveContext.locals.siteContext.siteSubdirectory + stem;
        }
        return stem
    }
};



HyprLive.engine.setTag('make_url', MakeUrlTag.parse, MakeUrlTag.compile, false, false);
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

    function getProductAttributeValues(product, attributeName, useNonStringValue) {
        var attr = getProductAttribute(product, attributeName), primitiveValues = [], values;
        var preferredValueProp = useNonStringValue ? 'value' : 'stringValue',
            secondaryValueProp = useNonStringValue ? 'stringValue' : 'value';
        if (attr) {
            values = prop(attr, 'values', true);
            if (values) {
                for (var i = 0; i < values.length; i++) {
                    primitiveValues[i] = prop(values[i], preferredValueProp, true)
                                        || prop(values[i], secondaryValueProp, true);
                }
                return primitiveValues;
            }
        }
        return '';
    }

    function getProductAttributeFirstValue(product, attributeName, useNonStringValue) {
        var values = getProductAttributeValues(product, attributeName, useNonStringValue);
        if (values) return values[0];
    }

    HyprLive.engine.setFilter('findwhere', findWhere);

    HyprLive.engine.setFilter('prop', prop);

    HyprLive.engine.setFilter('get_product_attribute', getProductAttribute);

    HyprLive.engine.setFilter('get_product_attribute_values', getProductAttributeValues);

    HyprLive.engine.setFilter('get_product_attribute_value', getProductAttributeFirstValue);


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
			return HyprLive;
		});
		// UMD boilerplate
	})(typeof externalDefine === "function" && externalDefine.amd
		? externalDefine
		: function (deps, factory) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = factory(window.HyprLiveContext))
				: root.Hypr = factory(window.HyprLiveContext)
		}
	);
    // put that back where you found it, young man
    root.define = externalDefine;
}(this));