<%= banner %>
(function() {
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