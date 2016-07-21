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
        })
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
        } else if (type !== 'paging' || params[i] !== 'page') {
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
    productUrl: function(object, extendedQuery) {
        var code = typeof object === 'object' ? object.productCode : object;
        return this.urlScrub('/p/' + code + extendedQuery);
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
        return url.replace(/(&$)|(\?$)/g,'').replace(/\?&/, '?').replace(/&+/g, '&');
    }
};



HyprLive.engine.setTag('make_url', MakeUrlTag.parse, MakeUrlTag.compile, false, false);