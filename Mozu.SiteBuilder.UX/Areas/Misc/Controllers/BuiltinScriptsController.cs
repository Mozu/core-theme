using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.IO;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.Mvc;
using dotless.Core;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Microsoft.Win32;
using dotless.Core.Parser.Infrastructure.Nodes;
using dotless.Core.Parser.Infrastructure;
using dotless.Core.Parser.Tree;
using dotless.Core.Exceptions;
using System.Text.RegularExpressions;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{

    public class BuiltinScriptsController : BaseApiController
    {
        public BuiltinScriptsController()
        {
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "sdk")]
        public ActionResult Sdk(string mode)
        {
            string fileName;
            switch(mode) {
                case "debug":
                    fileName = "mozu-javascript-sdk.debug.js";
                    break;
                case "affiliatetrackingmin":
                    fileName = "mozu-javascript-sdk-affiliatetracking.min.js";
                    break;
                case "affiliatetrackingdebug":
                    fileName = "mozu-javascript-sdk-affiliatetracking.js";
                    break;
                default:
                    fileName = "mozu-javascript-sdk.min.js";
                    break;
            }
            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("js-sdk-build-dir"),fileName), "text/javascript");
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "require")]
        public ActionResult Require(string mode = "min")
        {
            string fileName = mode == "debug" ? "mozu-require.debug.js" : "mozu-require.min.js";

            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("require-js-build-dir"), fileName), "text/javascript");
        }
          [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ConfigKey = "hyprlive")]
        public ActionResult HyprLive(string mode = "min")
        {
            string fileName = mode == "debug" ? "mozu-hyprlive.debug.js" : "mozu-hyprlive.min.js";

            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("hyprlive-build-dir"), fileName), "text/javascript");
        }

    }
}
