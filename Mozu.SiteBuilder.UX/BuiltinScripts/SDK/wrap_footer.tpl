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