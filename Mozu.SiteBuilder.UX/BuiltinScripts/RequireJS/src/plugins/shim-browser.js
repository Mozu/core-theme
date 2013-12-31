/** @license
 * Shims non-AMD scripts with a define call. Based on depend.js require plugin by Miller Medeiros. Version 0.2.0 dependent on Mozu controller.
 * Author: James Zetlen, Volusion
 * Version: 0.2.0 (2012/11/29)
 * Released under the MIT license
 */
define('shim', function () {

    var nameRE = /[^\[>]+/,
        exportRE = />([^\]]+)$/;
    return {
        load: function (name, req, onLoad, config) {
            var modulePath = nameRE.exec(name),
                exportMatch = exportRE.exec(name),
                exportValue = "",
                deps = "";
            if (!modulePath) throw new Error("Cannot parse AMD dependency array.");
            modulePath = req.toUrl(modulePath[0] + ".js");
            if (exportMatch) {
                exportValue = exportMatch[1];
            }
            var firstBr = name.indexOf('['),
                lastBr = name.lastIndexOf(']');
            if (firstBr !== -1) {
                deps = name.substring(firstBr + 1, lastBr);
            }
            var sep = modulePath.indexOf('?') === -1 ? '?' : '&';
            req([modulePath + sep + 'shimRequire=' + encodeURIComponent(deps).replace(/!/g, "%21") + '&shimExport=' + exportValue], onLoad);
        }
    }

});