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

var HyprLive = {
    engine: new amds[0].Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}'],
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