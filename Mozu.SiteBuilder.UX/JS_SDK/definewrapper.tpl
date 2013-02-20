<%= banner %>

(function (define) {
    define(function () {
		<%= body %>
		return <%= toExport %>;
    });
    // boilerplate below makes this library compatible with AMD, CJS, and a plain browser environment
})(typeof define === "function" && define.amd
    ? function() {
		// hiding that this is a real AMD define from inner modules
		define.apply(this, arguments);
	}
    : function (fn) {
        typeof exports === "object" && typeof module === "object"
            ? (module.exports = fn())
            : (this.<%= exportAs %> = fn())
    }
);