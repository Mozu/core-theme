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
            