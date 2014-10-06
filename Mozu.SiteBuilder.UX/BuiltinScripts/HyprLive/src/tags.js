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
        return DropZoneTag.format.join(dropzoneName.substring(1, dropzoneName.length-1));
    }
};

HyprLive.engine.setTag('dropzone', DropZoneTag.parse, DropZoneTag.compile, false, false);