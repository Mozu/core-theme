 (function(root) {	// the definewrapper.tpl exists pretty much just to catch swig.js's browserified, deferred attempt to register itself with an external AMD loader.
	var swig,
	swigDefine = function(name, deps, fac) {
        if (name !== "swig") return externalDefine.apply(this, arguments);
        swig = fac();
        root.define = externalDefine;
	};
	swigDefine.amd = {};
    // only while this library is evaluating, let's replace window.define
    var externalDefine = root.define;
    var define = root.define = swigDefine;
	(function (exportFn) {
		exportFn(['text!../livetemplates'], function (LiveTemplates) {
            if (!LiveTemplates) throw {
                name: "Live templates not found",
                message: "If no AMD loader is present, there must be a global variable named LiveTemplates for HyprLive to function."
            };
            LiveTemplates = JSON.parse(LiveTemplates);
/*
            try {
            var TemplateContext = JSON.parse(document.getElementById('data-mz-preload-templatecontext').textContent);
            } catch(e) {
                throw {
                    name: 'Template context not found',
                    message: 'The page template needs to preload the template context using the preload_json tag.'
                }
            }
            */
            try {
            var ThemeSettings = require.mozuData('themesettings');
            } catch(e) {
                throw new ReferenceError('The page template needs to preload the theme settings using {% preload_json themeSettings "themesettings" %},.');
            }