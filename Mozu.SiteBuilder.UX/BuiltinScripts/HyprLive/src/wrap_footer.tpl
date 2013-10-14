			return HyprLive;
		});
		// boilerplate below makes this library compatible with AMD, CJS, and a plain browser environment
	})(typeof externalDefine === "function" && externalDefine.amd
		? externalDefine
		: function (throwAwayDeps, factory) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = factory())
				: root.HyprLive = factory()
		}
	);
}(this));