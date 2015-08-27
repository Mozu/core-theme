			return HyprLive;
		});
		// UMD boilerplate
	})(typeof externalDefine === "function" && externalDefine.amd
		? externalDefine
		: function (deps, factory) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = factory(window.HyprLiveContext))
				: root.Hypr = factory(window.HyprLiveContext)
		}
	);
    // put that back where you found it, young man
    root.define = externalDefine;
}(this));