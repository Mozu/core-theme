<%= banner %>
(function() {	// the definewrapper.tpl uses a super-slim override of "define" that pushes AMD deps into an array.
    // this allows us to cleanly vendor AMD-compatible scripts without polluting scope.
    // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
	var amds = [],
	internalDefine = function(deps, fn) {
		if (typeof deps === "function") fn = deps;
		amds.push(fn());
	};
	internalDefine.amd = true;
	(function (define, exportFn) {
		exportFn(function () {
			<%= body %>
			return <%= toExport %>;
		});
		// boilerplate below makes this library compatible with AMD, CJS, and a plain browser environment
	})(internalDefine,
		typeof define === "function" && define.amd
		? define
		: function (fn) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = fn())
				: (this.<%= exportAs %> = fn())
		}
	);
}());