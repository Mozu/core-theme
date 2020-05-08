using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.UX.Filters;
using System.Threading;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using NotFoundResult = Microsoft.AspNetCore.Mvc.NotFoundResult;
using FileResult = Mozu.SiteBuilder.Mvc.ActionResults.FileResult;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    [ForceCDNUseFilter]
    [NoCookieFilter]
    public class ResourceController : BaseApiController
    {
        readonly Lazy<IMozuVirtualPathProvider> _pathProvider;
        readonly Lazy<INavigationGandalf> _navGandalf;
        readonly Lazy<IThemeContentRetriever> _contentRetriever;
        readonly ILogger _logger;
        readonly Lazy<AMDModuleProvider> _moduleProvider;
        private readonly IContentTypeProvider _fileExtensionContentTypeProvider;
        readonly ISettings _settings;
        readonly IApiContext _apiContext;
        readonly ITemplateInheritanceHandler _templateGetter;

        public ResourceController(Lazy<IMozuVirtualPathProvider> pathProvider, 
            Lazy<INavigationGandalf> gandalf, 
            Lazy<IThemeContentRetriever> contentRetriever, 
            ILogger logger, 
            ISettings settings, 
            IApiContext apiContext, 
            ITemplateInheritanceHandler templateGetter,
            Lazy<AMDModuleProvider> amdModuleProvider,
            IContentTypeProvider fileExtensionContentTypeProvider)
        {
            _navGandalf = gandalf;
            _contentRetriever = contentRetriever;
            _logger = logger;
            _pathProvider = pathProvider;
            _apiContext = apiContext;
            _settings = settings;
            _moduleProvider = amdModuleProvider;
            _fileExtensionContentTypeProvider = fileExtensionContentTypeProvider;
            _templateGetter = templateGetter;
        }

        DataViewModeType Convert(string dataViewModeString)
        {
            switch ((dataViewModeString ?? "").ToLowerInvariant())
            {
                case "p":
                    {
                        return DataViewModeType.Pending;
                    }
                case "l":
                    {
                        return DataViewModeType.Live;
                    }

            }
            return SbApiContext.DataViewMode;
        }

        [ResponseCache(CacheProfileName = "default")]

        //[ClientCacheHeaders(ConfigKey = "stylesheets")]
        [HttpGet]
        public IActionResult Stylesheets(string pathinfo, bool? debug = false, string dv = null)
        {
            SbApiContext.SetDataMode(Convert(dv));

            return Path.GetExtension(pathinfo) == ".less" ?
                Less(pathinfo, debug) : // TODO: set debug to false later
                Content("stylesheets/" + pathinfo);
        }

        [ClientCacheHeaders(ConfigKey = "stylesheets")]
        [HttpGet]
        public IActionResult Less(string pathinfo= null , bool? debug = false)
        {
            var res = Content("stylesheets/" + pathinfo, "text/css");
            if (!(res is MozuVirtualFileResult oc)) return res;
            var emitDebugStylesheet = Request.GetTypedHeaders().Accept.Contains(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("text/css"));
            oc.Transform = new LessTransFormer(pathinfo, debug.GetValueOrDefault(false), emitDebugStylesheet, this, _pathProvider.Value, _contentRetriever.Value).Transform;

            return res;
        }

        [ClientCacheHeaders(ConfigKey = "livetemplates")]
        [HttpGet]
        public async Task<JObject> LiveTemplates(bool? debug = false)
        {
            var templates = await _templateGetter.GetAndExpandTemplates().ConfigureAwait(false);
            var jobj = new JObject();
            jobj.AddRange(templates.Select(x => new JProperty(x.key?.ToLowerInvariant(), x.scrubbedContent)));
            return jobj;
        }

        [HttpGet]
        [ClientCacheHeaders(ConfigKey = "receiver")]
        public IActionResult MozuReceiver(int receiverVersion)
        {
            return File("/Assets/mozu_receiver_v" + receiverVersion + ".html", "text/html");
        }

        [HttpGet]
        [ClientCacheHeaders(ConfigKey = "receiver")]
        public IActionResult MozuReceiver()
        {
            return File("/Assets/mozu_receiver.html", "text/html");
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        [HttpGet]
        public IActionResult CompiledScripts(string pathinfo)
        {
            var resp = Content("compiled/scripts/" + pathinfo, "text/javascript");
            if (resp is NotFoundResult)
            {
                resp = Scripts(pathinfo);
            }
            return resp;
        }

        [ClientCacheHeaders(ConfigKey = "static")]
        [HttpGet]
        public IActionResult StaticContentShare(string relativePath)
        {
            
            var sharedFolder = _settings.AppSettings("SiteBuilderStaticContent");
            var pathPrefix = Path.IsPathRooted(sharedFolder) ? "" : @"\\";
            var tenantShareRoot = $"{pathPrefix}{sharedFolder}/t-{_apiContext.TenantId}";
            var fileName = Path.Combine(tenantShareRoot, relativePath);
            
            if (checkRequestContent(relativePath, tenantShareRoot) || !System.IO.File.Exists(fileName))
            {
                return NotFound();
            }
            else
            {
                var ss = System.IO.File.Open(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                string mimeType = null;
                _fileExtensionContentTypeProvider.TryGetContentType(fileName, out mimeType);
                //var exists = Constants.MimeTypes.MimeTypesByExtension.Value.TryGetValue(Path.GetExtension(fileName), out var fileType);

                return File(ss, mimeType ??  "text/html");
            }
        }

        bool checkRequestContent(string relativePath, string sharedFolder)
        {
            var sharedFolderPath = Path.GetFullPath(sharedFolder);
            var relFull = Path.GetFullPath(Path.Combine(sharedFolder, relativePath));
            return !relFull.StartsWith(sharedFolderPath, StringComparison.OrdinalIgnoreCase);
        }

        [ClientCacheHeaders(ConfigKey = "navigation")]
        [HttpGet]
        public JArray AjaxNavigation()
        {
            var nav =  _navGandalf.Value.GetTreeNavigation();
            return JArray.FromObject(nav);
        }

        [ClientCacheHeaders(ConfigKey = "siteContext")]
        [HttpGet]
        public async Task<ActionResult> HyprContextAction(string dv = null)
        {
            await SiteContext.Init();
            SbApiContext.SetDataMode(Convert(dv));
            var ctx = new Dictionary<string, object>();
            var locals = new Dictionary<string, object>();
            var siteContext = new Dictionary<string, object>();
            var templates = await LiveTemplates().ConfigureAwait(false);
            ctx.Add("templates", templates);
            ctx.Add("locals", locals);

            var settingsDic = SiteContext.ThemeSettings?.InnerDictionary;

            //filter out server side only parameters
            settingsDic = settingsDic?.Where(x => !x.Key.StartsWith("__")).ToDictionary(x => x.Key, y => y.Value);


            var setting = JObject.FromObject(settingsDic);
            
            locals.Add("themeSettings", setting);// SiteContext.ThemeSettings);
            locals.Add("labels", SiteContext.Labels);
            locals.Add("siteContext", siteContext);

            siteContext.Add("themeId", SiteContext.ThemeId);
            siteContext.Add("generalSettings", SiteContext.GeneralSettings);
            siteContext.Add("checkoutSettings", SiteContext.CheckoutSettings);
            siteContext.Add("cdnPrefix", SiteContext.CdnPrefix);
            siteContext.Add("secureHost", SiteContext.SecureHost);
            siteContext.Add("supportsInStorePickup", SiteContext.SupportsInStorePickup);
            siteContext.Add("currencyInfo", SiteContext.CurrencyInfo);
            siteContext.Add("siteSubdirectory", SiteContext.SiteSubdirectory);
          


            return new ObjectResult(ctx);
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        [HttpGet]
        public IActionResult Scripts(string pathinfo, string shimRequire = "", string shimExport = "", bool debug = false)
        {
            if (string.IsNullOrEmpty(shimRequire) && string.IsNullOrEmpty(shimExport))
            {
                return Content("scripts/" + pathinfo, "text/javascript");
            }
            return _moduleProvider.Value.CreateModule(Request, pathinfo, shimRequire, shimExport, debug);
        }

        [ClientCacheHeaders(ConfigKey = "images")]
        [HttpGet]
        public IActionResult Widget(string pathinfo)
        {
            var pos = pathinfo.IndexOf('/');
            if (pos <= -1) return new NotFoundResult();
            var widgetId = pathinfo.Substring(0, pos);
            var path = pathinfo.Substring(pos);
            var widget = SiteContext.Theme.Widgets.FirstOrDefault(x => x.Id == widgetId);
            if (widget == null) return new NotFoundResult();
            var fullPath = new FileInfo(widget.FullPath + path);
            if (!fullPath.Exists) return new NotFoundResult();
            return new FilePathResult(fullPath.FullName, GetMimeType(pathinfo));
        }

        [ClientCacheHeaders(ConfigKey = "templates")]
        [HttpGet]
        public IActionResult Templates(string pathinfo)
        {
            return Content("templates/" + pathinfo, "text/javascript");
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        [NoCdnForce]
        public IActionResult Misc(string pathinfo, string contentType = null)
        {
            var stem = "/resources/" + pathinfo;
            if (contentType == null)
            {
                contentType = GetMimeType(stem);
            }

            return GetFileResult(stem, contentType);
        }
      


        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        public IActionResult SiteThumbnail()
        {
            if (SiteContext.Theme.Thumbnail == null || string.IsNullOrEmpty(SiteContext.Theme.Thumbnail.Name))
                return new NotFoundObjectResult("Theme thumbnail not specified.");

            var stem = "/" + SiteContext.Theme.Thumbnail.Name;
            var contentType = GetMimeType(stem);


            return GetFileResult(stem, contentType);
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        public new IActionResult Content(string pathinfo, string contentType = null)
        {
            var resolvedContentType = contentType ?? GetMimeType(pathinfo);
            return GetFileResult(pathinfo, resolvedContentType);
        }

        IActionResult GetFileResult(string pathinfo, string contentType)
        {
            var file = _pathProvider.Value.GetThemeFileInfo(pathinfo);
            if (file == null) return NotFound();
            return new MozuVirtualFileResult(pathinfo, contentType, file, _contentRetriever.Value, this.SbApiContext.RequestCancellationToken);
        }

        string GetMimeType(string path)
        {
            string mimeType = null;
            _fileExtensionContentTypeProvider.TryGetContentType(path, out mimeType);

            return mimeType ?? "application/unknown";
        }

        public class MozuVirtualFileResult : FileResult
        {
            private readonly ThemeFileSystemInfo _file;
            private readonly IThemeContentRetriever _contentRetriever;
            readonly CancellationToken _cancellationToken;

            public MozuVirtualFileResult(string path, string contentType, ThemeFileSystemInfo file, IThemeContentRetriever contentRetriever, 
                CancellationToken cancellationToken)
                : base(contentType)
            {
                _file = file;
                _contentRetriever = contentRetriever;
                _cancellationToken = cancellationToken;
            }

            public Func<Stream, string, Task<Stream>> Transform { get; set; }

            protected override void WriteFile(HttpResponse response)
            {
                WriteFile(response.Body);
            }

            public void WriteFile(Stream outputStream)
            {
                using var stream = _contentRetriever.GetStream(_file, _cancellationToken);
                var source = stream;
                if (Transform != null)
                {
                    source = Transform(stream, _file.VirtualPath).Result;
                }
                source.CopyTo(outputStream);
            }

            protected override async Task WriteFileAsync(HttpResponse response)
            {
                await using var stream = _contentRetriever.GetStream(_file, _cancellationToken);
                var source = stream;
                if (Transform != null)
                {
                    source = await Transform(stream, _file.VirtualPath).ConfigureAwait(false);
                }
                await source.CopyToAsync(response.Body).ConfigureAwait(false);
            }
        }
    }
}