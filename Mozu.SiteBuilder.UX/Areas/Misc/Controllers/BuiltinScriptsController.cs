
using Microsoft.AspNetCore.Mvc;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.UX.Controllers;
using System.IO;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{

    public class BuiltinScriptsController : BaseApiController
    {
        public BuiltinScriptsController()
        {
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "sdk")]
        public IActionResult Sdk(string mode)
        {
            var fileName = mode == "debug" ? "mozu-javascript-sdk.debug.js" : "mozu-javascript-sdk.min.js";

            return File(Path.Combine(MozuConfigurationManager.Settings.AppSettings("js-sdk-build-dir"),fileName), "text/javascript");
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "require")]
        public IActionResult Require(string mode = "min")
        {
            var fileName = mode == "debug" ? "mozu-require.debug.js" : "mozu-require.min.js";

            return File(Path.Combine(MozuConfigurationManager.Settings.AppSettings("require-js-build-dir"), fileName), "text/javascript");
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "hyprlive")]
        public IActionResult HyprLive(string mode = "min")
        {
            var fileName = mode == "debug" ? "mozu-hyprlive.debug.js" : "mozu-hyprlive.min.js";

            return File(Path.Combine(MozuConfigurationManager.Settings.AppSettings("hyprlive-build-dir"), fileName), "text/javascript");
        }
    }
}
