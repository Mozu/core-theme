using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.Mvc;
using System.IO;
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

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class SDKResourceController : BaseController
    {
        public SDKResourceController(ISiteBuilderContext sbContext, IThemeSettingsRepository themeSettingsRepository, DjangoMozuViewEngine viewEngine)
        {
        }

        [ClientCacheHeaders(ConfigKey = "sdk")]
        public ActionResult All()
        {
            return File("~/JS_SDK/dist/mozu-sdk.js", "text/javascript");
        }

        [ClientCacheHeaders(ConfigKey = "sdk")]
        public ActionResult Debug()
        {
            return File("~/JS_SDK/dist/mozu-sdk.debug.js", "text/javascript");
        }

        [ClientCacheHeaders(ConfigKey = "sdk")]
        public ActionResult Min()
        {
            return File("~/JS_SDK/dist/mozu-sdk.min.js", "text/javascript");
        }

    }
}
