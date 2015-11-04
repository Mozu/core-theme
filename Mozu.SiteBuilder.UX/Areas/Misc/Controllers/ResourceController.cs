using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using Autofac;
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

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    [ForceCDNUseFilter]
    public class ResourceController : BaseApiController
    {
        readonly Lazy<IMozuVirtualPathProvider> _pathProvider;
        readonly Lazy<INavigationGandalf> _navGandalf;
        readonly Lazy<IThemeContentRetriever> _contentRetriever;
        readonly Core.Logging.ILogger _logger;
        readonly Lazy<AMDModuleProvider> _moduleProvider;
        readonly ISettings _settings;
        readonly IApiContext _apiContext;
        readonly static Lazy<JsonpMediaTypeFormatter> _jmtf = new Lazy<JsonpMediaTypeFormatter>(() => new JsonpMediaTypeFormatter(GlobalConfiguration.Configuration.Formatters.JsonFormatter));
        readonly ITemplateInheritanceHandler _templateGetter;

        public ResourceController(Lazy<IMozuVirtualPathProvider> pathProvider, 
            Lazy<INavigationGandalf> gandalf, 
            Lazy<IThemeContentRetriever> contentRetriever, 
            Core.Logging.ILogger logger, 
            ISettings settings, 
            IApiContext apiContext, 
            ITemplateInheritanceHandler templateGetter,
            Lazy<AMDModuleProvider> amdModuleProvider)
        {
            _navGandalf = gandalf;
            _contentRetriever = contentRetriever;
            _logger = logger;
            _pathProvider = pathProvider;
            _apiContext = apiContext;
            _settings = settings;
            _moduleProvider = amdModuleProvider;
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

        [ClientCacheHeaders(ConfigKey = "stylesheets")]
        [HttpGet]
        public HttpResponseMessage Stylesheets(string pathinfo, bool debug = false, string dv = null)
        {
            SbApiContext.SetDataMode(Convert(dv));

            return Path.GetExtension(pathinfo) == ".less" ?
                Less(pathinfo, debug) : // TODO: set debug to false later
                Content("stylesheets/" + pathinfo);
        }

        [ClientCacheHeaders(ConfigKey = "stylesheets")]
        [HttpGet]
        public HttpResponseMessage Less(string pathinfo, bool debug = false)
        {
            var res = Content("stylesheets/" + pathinfo, "text/css");
            var oc = res.Content as ObjectContent<MozuVirtualFileResult>;
            bool emitDebugStylesheet = Request.Headers.Accept.Contains(new MediaTypeWithQualityHeaderValue("text/css"));
            if (oc != null)
            {

                ((MozuVirtualFileResult)oc.Value).Transform = new LessTransFormer(pathinfo, debug, emitDebugStylesheet, this, _pathProvider.Value, _contentRetriever.Value).Transform;
            }

            return res;
        }

        [ClientCacheHeaders(ConfigKey = "livetemplates")]
        [HttpGet]
        public async Task<JObject> LiveTemplates(bool? debug = false)
        {
            var templates = await _templateGetter.GetAndExpandTemplates().ConfigureAwait(false);
            var jobj = new JObject();
            jobj.AddRange(templates.Select(x => new JProperty(x.key, x.scrubbedContent)));
            return jobj;
        }

        [HttpGet]
        [ClientCacheHeaders(ConfigKey = "receiver")]
        public ActionResult MozuReceiver(int receiverVersion)
        {
            return File("/Assets/mozu_receiver_v" + receiverVersion + ".html", "text/html");
        }

        [HttpGet]
        [ClientCacheHeaders(ConfigKey = "receiver")]
        public ActionResult MozuReceiver()
        {
            return File("/Assets/mozu_receiver.html", "text/html");
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        [HttpGet]
        public HttpResponseMessage CompiledScripts(string pathinfo)
        {
            var resp = Content("compiled/scripts/" + pathinfo, "text/javascript");
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                resp = Scripts(pathinfo);
            }
            return resp;
        }

        [ClientCacheHeaders(ConfigKey = "static")]
        [HttpGet]
        public HttpResponseMessage StaticContentShare(string relativePath)
        {
            var sharedFolder = _settings.AppSettings("SiteBuilderStaticContent");
            var pathPrefix = System.IO.Path.IsPathRooted(sharedFolder) ? "" : @"\\";
            var tenantId = "t-" + _apiContext.TenantId;
            var fileName = pathPrefix + sharedFolder + "/" + tenantId + "/" + relativePath;
            
            if (checkRequestContent(relativePath, sharedFolder) || !System.IO.File.Exists(fileName))
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
            else
            {
                var SourceStream = System.IO.File.Open(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                var content = new StreamContent(SourceStream);
                string fileType;
                var exists = Constants.MimeTypes.MimeTypesByExtension.Value.TryGetValue(Path.GetExtension(fileName), out fileType);
                var resp = Request.CreateResponse(HttpStatusCode.OK);

                resp.Content = content;
                resp.Content.Headers.ContentLength = SourceStream.Length;
                resp.Content.Headers.ContentType = new MediaTypeHeaderValue(exists ? fileType : "text/html");

                return resp;
            }
        }

        bool checkRequestContent(string relativePath, string sharedFolder)
        {
            return relativePath.Contains("..");
        }

        [ClientCacheHeaders(ConfigKey = "navigation")]
        [HttpGet]
        public async Task<JArray> AjaxNavigation()
        {
            var nav = await _navGandalf.Value.GetTreeNavigation();
            return JArray.FromObject(nav);
        }

        [ClientCacheHeaders(ConfigKey = "siteContext")]
        [HttpGet]
        public HttpResponseMessage HyprContextAction(string dv = null)
        {
            SbApiContext.SetDataMode(Convert(dv));
            var ctx = new Dictionary<string, object>();
            var locals = new Dictionary<string, object>();
            var siteContext = new Dictionary<string, object>();

            ctx.Add("templates", LiveTemplates().Result);
            ctx.Add("locals", locals);

            locals.Add("themeSettings", SiteContext.ThemeSettings);
            locals.Add("labels", SiteContext.Labels);
            locals.Add("siteContext", siteContext);

            siteContext.Add("themeId", SiteContext.ThemeId);
            siteContext.Add("generalSettings", SiteContext.GeneralSettings);
            siteContext.Add("checkoutSettings", SiteContext.CheckoutSettings);
            siteContext.Add("cdnPrefix", SiteContext.CdnPrefix);
            siteContext.Add("secureHost", SiteContext.SecureHost);
            siteContext.Add("supportsInStorePickup", SiteContext.SupportsInStorePickup);
            siteContext.Add("currencyInfo", SiteContext.CurrencyInfo);

            return Request.CreateResponse(HttpStatusCode.OK, ctx, GetJsonMediaFormatter(ctx.GetType()));
        }
        
        MediaTypeFormatter GetJsonMediaFormatter(Type t)
        {
            return _jmtf.Value.GetPerRequestFormatterInstance(t, Request, new MediaTypeHeaderValue("text/json"));
        }

        [ClientCacheHeaders(ConfigKey = "scripts")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage Scripts(string pathinfo, string shimRequire = "", string shimExport = "", bool debug = false)
        {
            if (string.IsNullOrEmpty(shimRequire) && string.IsNullOrEmpty(shimExport))
            {
                return Content("scripts/" + pathinfo, "text/javascript");
            }
            return _moduleProvider.Value.CreateModule(Request, pathinfo, shimRequire, shimExport, debug);
        }

        [ClientCacheHeaders(ConfigKey = "images")]
        [HttpGet]
        public HttpResponseMessage Widget(string pathinfo)
        {
            int pos = pathinfo.IndexOf('/');
            if (pos > -1)
            {
                string widgetId = pathinfo.Substring(0, pos);
                string path = pathinfo.Substring(pos);
                WidgetDefinition widget = SiteContext.Theme.Widgets.FirstOrDefault(x => x.Id == widgetId);
                if (widget != null)
                {
                    var fullPath = new FileInfo(widget.FullPath + path);
                    if (fullPath.Exists)
                    {
                        return Request.CreateResponse(HttpStatusCode.OK, new FilePathResult(fullPath.FullName, GetMimeType(pathinfo)));
                    }
                }
            }
            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");
        }

        [ClientCacheHeaders(ConfigKey = "templates")]
        [HttpGet]
        public HttpResponseMessage Templates(string pathinfo)
        {
            return Content("templates/" + pathinfo, "text/javascript");
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        public HttpResponseMessage Misc(string pathinfo, string contentType = null)
        {
            string stem = "/resources/" + pathinfo;
            if (contentType == null)
            {
                contentType = GetMimeType(stem);
            }

            return GetFileResult(stem, contentType);
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        public HttpResponseMessage SiteThumbnail()
        {
            if (SiteContext.Theme.Thumbnail == null || string.IsNullOrEmpty(SiteContext.Theme.Thumbnail.Name))
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Theme thumbnail not specified.");

            var stem = "/" + SiteContext.Theme.Thumbnail.Name;
            var contentType = GetMimeType(stem);


            return GetFileResult(stem, contentType);
        }

        [ClientCacheHeaders(ConfigKey = "content")]
        [HttpGet]
        public new HttpResponseMessage Content(string pathinfo, string contentType = null)
        {
            var resolvedContentType = contentType ?? GetMimeType(pathinfo);
            return GetFileResult(pathinfo, contentType);
        }

        HttpResponseMessage GetFileResult(string pathinfo, string contentType)
        {
            var file = _pathProvider.Value.GetThemeFileInfo(pathinfo);
            return file != null ?
                Request.CreateResponse(HttpStatusCode.OK, new MozuVirtualFileResult(pathinfo, contentType, file, _contentRetriever.Value)) :
                Request.CreateErrorResponse(HttpStatusCode.NotFound, "file not found");
        }

        string GetMimeType(string path)
        {
            string mimeType;
            var ext = Path.GetExtension(path);
            if (!Constants.MimeTypes.MimeTypesByExtension.Value.TryGetValue(ext, out mimeType))
            {
                mimeType = "application/unknown";
            }
            return mimeType;
        }

        public class MozuVirtualFileResult : FileResult
        {
            private readonly ThemeFileSystemInfo _file;
            private readonly IThemeContentRetriever _contentRetriever;

            public MozuVirtualFileResult(string path, string contentType, ThemeFileSystemInfo file, IThemeContentRetriever contentRetriever)
                : base(contentType)
            {
                _file = file;
                _contentRetriever = contentRetriever;
            }

            public Func<Stream, string, Stream> Transform { get; set; }

            protected override void WriteFile(HttpResponseBase response)
            {
                WriteFile(response.OutputStream);
            }

            public void WriteFile(Stream outputStream)
            {
                using (var stream = _contentRetriever.GetStream(_file))
                {
                    var source = stream;
                    if (Transform != null)
                    {
                        source = Transform(stream, _file.VirtualPath);
                    }
                    source.CopyTo(outputStream);
                }
            }

            protected override async Task WriteFileAsync(HttpResponseBase response)
            {
                using (var stream = _contentRetriever.GetStream(_file))
                {
                    var source = stream;
                    if (Transform != null)
                    {
                        source = Transform(stream, _file.VirtualPath);
                    }
                    await source.CopyToAsync(response.OutputStream);
                }
            }
        }
    }
}