//function NullTags() {
//    this.tags = ['require_script', 'json_attribute', 'data_attributes', 'dump'];

//    this.parse = function () {
//        return null;
//    }
//}

//HyprLive.addExtension('NullTags', new NullTags());


var nullParse = function () { return true; },
    nullCompile = function() {return ''};

var nullTags = ['require_script', 'json_attribute', 'data_attributes'];
for (var t = 0; t < nullTags.length; t++) {
    HyprLive.engine.setTag(nullTags[t], nullParse, nullCompile, false, true);
}

HyprLive.engine.setTag("comment", function (str, line, parser, types) {
    parser.on('*', function (token) {
        throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
    });

    return true;
}, function() { return '' }, true);



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