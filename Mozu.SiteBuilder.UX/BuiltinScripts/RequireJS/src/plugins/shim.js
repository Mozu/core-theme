/** @license
 * Shims non-AMD scripts with a define call. Based on depend.js require plugin by Miller Medeiros.
 * Author: James Zetlen, Volusion
 * Version: 0.1.0 (2012/11/29)
 * Released under the MIT license
 */
define('shim',['text'], function (text) {

    var unableToParse = 'Unable to parse shim dependency.',
        buildMap = {},
        nameRE = /[^\[>]+/,
        depNameRE = /(.+)=([a-zA-Z_$][0-9a-zA-Z_$]*)$/,
        exportRE = />([^\]]+)$/,
    // because you can have arbitrarily nested shims, a JS regex cannot parse the whole thing, so we have to use string methods.
        parseDeps = function (name) {
            var firstBr = name.indexOf('['),
                lastBr = name.lastIndexOf(']'),
                parsedName = nameRE.exec(name),
                parsedExport = exportRE.exec(name),
                deps,
                namedDeps = [],
                anonDeps = [],
                args = [];

            if (!parsedName) throw unableToParse;

            var modName = parsedName[0],
                toExport = parsedExport ? parsedExport[1] : null;

            if (firstBr !== -1 && lastBr !== -1) {
                var depsString = name.substring(firstBr + 1, lastBr),
                    depName,
                    depMatch,
                    nestingLevel = 0,
                    lastCommaIndex = -1,
                    isComma = false,
                    char;
                for (var i = 0; i < depsString.length; i++) {
                    char = depsString.charAt(i);
                    if (char === "[") nestingLevel++;
                    if (char === "]") nestingLevel--;
                    isComma = char === (',');
                    if (nestingLevel < 0) throw unableToParse;
                    if ((isComma || i + 1 === depsString.length) && nestingLevel === 0) {
                        depName = depsString.substring(lastCommaIndex + 1, isComma ? i : i + 1);
                        depMatch = depNameRE.exec(depName);
                        if (depMatch) {
                            namedDeps.push(depMatch[1]);
                            args.push(depMatch[2]);
                        } else {
                            anonDeps.push(depName);
                        }
                        lastCommaIndex = i;
                    }
                }

            }

            return { name: modName, deps: namedDeps.concat(anonDeps), args: args, toExport: toExport };

        },

        namedTmpl = 'define(\'{4}\',[{0}], function({1}) { \n\n{2} ; \n\nreturn {3}; });\n\n\n//@ sourceURL=/{4}.js\n\n',
        anonTmpl = namedTmpl.replace('\'{4}\',', ''),
        createTextModule = function (parsedConf, body, named) {
            var stringDeps = parsedConf.deps.length > 0 ? "'" + parsedConf.deps.join("','") + "'" : '';
            return (named ? namedTmpl : anonTmpl)
                    .split('{0}').join(stringDeps)
                    .split('{1}').join(parsedConf.args.join(","))
                    .split('{3}').join(parsedConf.toExport)
                    .split('{4}').join(parsedConf.name)
                    .split('{2}').join(body);
        };


    return {

        write: function (pluginName, moduleName, write, config) {
            var parsedConf = parseDeps(moduleName);
            if (buildMap.hasOwnProperty(parsedConf.name)) {
                write.asModule(pluginName + '!' + moduleName, createTextModule(parsedConf, buildMap[parsedConf.name]));
            } else {
                text.get(require.toUrl(parsedConf.name), function (txt) {
                    buildMap[parsedConf.name] = txt;
                    write.asModule(pluginName + '!' + moduleName, createTextModule(parsedConf, txt));
                });
            }
        },

        // example: shim!vendor/jquery.ui.plugin[jquery=jQuery,jqueryui]
        // to export: shim!vendor/backbone[shim!underscore>_]>Backbone
        load: function(name, req, onLoad, config) {
            var parsedConf = parseDeps(name),
                onloadFn = function(txt) {
                    if (config.isBuild) buildMap[parsedConf.name] = txt;
                    eval(createTextModule(parsedConf, txt, true));
                    req([parsedConf.name], onLoad);
                };

            onloadFn.error = function() {
                onLoad.error.apply(onLoad, arguments);
            };

            text.load(parsedConf.name + '.js', req, onloadFn, config);
        }
        

    };

});