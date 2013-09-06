using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
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

    public class BuiltinScriptsController : BaseController
    {
        public BuiltinScriptsController(ISiteBuilderContext sbContext, IThemeSettingsRepository themeSettingsRepository, DjangoMozuViewEngine viewEngine)
        {
        }

        [ClientCacheHeaders(ConfigKey = "sdk")]
        public ActionResult Sdk(string mode)
        {
            string fileName;
            switch(mode) {
                case "debug":
                    fileName = "mozu-sdk.debug.js";
                    break;
                case "min":
                    fileName = "mozu-sdk.min.js";
                    break;
                default: 
                    fileName = "mozu-sdk.js";
                    break;
            }
            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("js-sdk-build-dir"),fileName), "text/javascript");
        }

        //[ClientCacheHeaders(ConfigKey = "sdk")]
        //public ActionResult SdkDebug()
        //{
        //    return File("~/JS_SDK/dist/mozu-sdk.debug.js", "text/javascript");
        //}

        //[ClientCacheHeaders(ConfigKey = "sdk")]
        //public ActionResult SdkMin()
        //{
        //    return File("~/JS_SDK/dist/mozu-sdk.min.js", "text/javascript");
        //}

        [ClientCacheHeaders(ConfigKey = "require")]
        public ActionResult Require(string mode = "min")
        {
            string fileName = mode == "debug" ? "require.js" : "require.min.js";

            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("require-js-build-dir"), fileName), "text/javascript");
        }

        private static HashSet<string> RequirePluginNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "text",
            "i18n",
            "shim"
        };

        [ClientCacheHeaders(ConfigKey = "requireplugins")]
        public ActionResult RequirePlugins(string mode)
        {
            if (!RequirePluginNames.Contains(mode))
            {
                throw new FileNotFoundException();
            }

            return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("require-js-plugin-dir"), mode + ".js"), "text/javascript");
        }

        //[ClientCacheHeaders(ConfigKey = "hyperlive")]
        //public ActionResult HyperLive(string mode = "min")
        //{
        //    string fileName = mode == "debug" ? "hyperlive.debug.js" : "hyperlive.js";

        //    return File(System.IO.Path.Combine(MozuConfigurationManager.AppSettings("hyperlive-build-dir"), fileName), "text/javascript");
        //}

    }
}
