			return HyprLive;
		});
		// UMD boilerplate
	})(typeof externalDefine === "function" && externalDefine.amd
		? externalDefine
		: function (factory) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = factory())
				: root.Hypr = factory()
		}
	);
    // put that back where you found it, young man
    root.define = externalDefine;
}(this));