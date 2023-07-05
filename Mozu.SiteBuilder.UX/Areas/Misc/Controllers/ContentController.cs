using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Configuration;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.Middleware;
using FileStreamResult = Mozu.SiteBuilder.Mvc.ActionResults.FileStreamResult;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    [NoCookieFilter]
    [AccessAllowOriginFilter]
    public class ContentController : ApiControllerBase
    {
        private const string RpVersionHeaderKey = "x-vol-rp-ver";
        static readonly ConcurrentDictionary<int, Site> _siteLookup = new ConcurrentDictionary<int, Site>();

        static readonly ConcurrentDictionary<int, Tenant.Contracts.Tenant> _tenantLookup =
            new ConcurrentDictionary<int, Tenant.Contracts.Tenant>();

        //static long Quality = 60;
        IApiContext _appCtx;
        readonly ISettings _settings;
        ContentFetcher _docRepo;
        Lazy<IGeneralSettingsWebApiClient> _generalSettingsWebApiClient;

        public ContentController(ContentFetcher docRepo, IApiContext appCtx, ISettings settings,
            Lazy<IGeneralSettingsWebApiClient> generalSettingsWebApiClient)
        {
            docRepo.InnerContext.SiteId = null;
            _docRepo = docRepo;
            _appCtx = appCtx;
            _settings = settings;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
        }

        Site LookupSite(int siteid)
        {
            var client = Request.HttpContext.RequestServices.Resolve<ISitesWebApiClient>().CloneWithoutUserClaims();
            var siteRes = client.GetSite(siteid, false).Result;
            return siteRes.ReadAsSync();
        }

        Tenant.Contracts.Tenant LookupTenant(int tenant)
        {
            var client = Request.HttpContext.RequestServices.Resolve<ITenantsWebApiClient>().CloneWithoutUserClaims();
            var res = client.GetTenantInternal(tenant, includeSoftDeletes: false, includeInactiveChildren: false)
                .Result;
            return res.ReadAsSync();
        }

        bool ShouldRedirectToCdn()
        {
            var disableCdn = _settings.AppSettings("disableCDN") == "true";
            var cdnHost = _settings.AppSettings("CdnHost");
            var cdnOriginHost = _settings.AppSettings("CdnOriginHost") ?? "";
            var hasAkamiOriginHop = this.Request.Headers.Any(x =>
                string.Equals(x.Key, "Akamai-Origin-Hop", StringComparison.OrdinalIgnoreCase));
            var uri = new Uri(PageContext.Url);
            return !disableCdn && !string.IsNullOrEmpty(cdnHost) && !cdnOriginHost.EqualsIgnoreCase(uri.Host) &&
                   !hasAkamiOriginHop;
        }

        [ClientCacheHeaders(ConfigKey = "images")]
        [HttpGet]
        public async Task<IActionResult> Index(
            int? tenant = null,
            int? mastercat = null,
            int? site = null,
            string list = "files@mozu.com",
            string documentId = null,
            int? size = null,
            int? max = null,
            int? maxWidth = null,
            int? maxHeight = null,
            int? width = null,
            int? height = null,
            string crop = null,
            int? quality = null)
        {
            //todo send out apology letter

            var shouldRedirectToCdn = ShouldRedirectToCdn();
            var isRewrite = Request.HttpContext.Items.ContainsKey(UrlRewritingMiddleware.IsSeoRewrite) &&
                            (bool)Request.HttpContext.Items[UrlRewritingMiddleware.IsSeoRewrite];

            ApiContext context = null;
            context = (ApiContext)_docRepo.ApiContext;
            if (site.HasValue)
            {
                var siteLookup = _siteLookup.GetOrAdd(site.Value, LookupSite);
                if (siteLookup == null)
                {
                    throw new FileNotFoundException("cant find site:" + site);
                }

                context.TenantId = siteLookup.TenantId;
                context.MasterCatalogId = siteLookup.MasterCatalogId;
                context.CatalogId = siteLookup.CatalogId;
                context.SiteId = siteLookup.Id;
                context.LocaleCode = siteLookup.DefaultLocaleCode;
            }

            if (mastercat.HasValue)
            {
                context.MasterCatalogId = mastercat.Value;
            }

            if (tenant.HasValue)
            {
                context.TenantId = tenant.Value;
            }

            context.UserClaims = null;
            ((ApiContext)this.SbApiContext).TenantId = context.TenantId;
            ((ApiContext)this.SbApiContext).MasterCatalogId = context.MasterCatalogId;
            ((ApiContext)this.SbApiContext).CatalogId = context.CatalogId;
            ((ApiContext)this.SbApiContext).SiteId = context.SiteId;
            ((ApiContext)this.SbApiContext).LocaleCode = context.LocaleCode;

            Dictionary<string, string> headers = new Dictionary<string, string>();
            if (this.Request.Headers.TryGetValue(RpVersionHeaderKey, out var version) && version.Any())
            {
                headers[RpVersionHeaderKey] = version.ToString();
            }

            var th = Request.GetTypedHeaders();

            HttpResponseMessage result = null;

            var isDocId = Guid.TryParse(documentId, out _);
            var documentNameForContent = string.Empty;

            if (!isDocId)
            {
	            documentNameForContent = GetDocumentNameForContent(documentId);
            }
            
            if (th.IfModifiedSince.HasValue || shouldRedirectToCdn)
            {
                if (isDocId)
                {
                    //When documentId is a guid
                    result = await _docRepo.GetDocumentContentHead(headers, list, documentId).ConfigureAwait(false);
                }
                else
                {
                    result = 
	                    await _docRepo.GetTreeDocumentContentHead(headers, list, documentNameForContent);
                }

                // we should have a lastmodified header on the HEAD request, but in some odd cases we may not.  if we don't find one then we should serve directly from the CMS.
                if (result.StatusCode == HttpStatusCode.NotFound) 
                    return NotFound();
                
                if (shouldRedirectToCdn && !isRewrite && result.Content.Headers.LastModified.HasValue)
                    return RedirectToCdn(list, documentId, result.Content.Headers.LastModified.Value);
                
                if (th.IfModifiedSince.GetValueOrDefault(DateTime.MinValue) >=
                    result.Content.Headers.LastModified.GetValueOrDefault(DateTimeOffset.MaxValue))
                    return StatusCode(304);
            }

            var range = th.Range?.Ranges?.FirstOrDefault();
            if (range?.From.HasValue == true &&
                string.Equals(th.Range.Unit.ToString(), "bytes", StringComparison.OrdinalIgnoreCase))
            {
                headers["Range"] = th.Range.ToString();
            }


            if (isDocId)
            {
                result = await _docRepo.TransformDocumentContent(
                    headers,
                    list,
                    documentId,
                    width: width ?? size,
                    height: height,
                    maxWidth: maxWidth ?? max,
                    maxHeight: maxHeight ?? max,
                    crop: crop,
                    quality: quality
                ).ConfigureAwait(false);
            }
            else
            {
                result = await _docRepo.TransformTreeDocumentContent(
                    headers,
                    list,
                    documentNameForContent,
                    width: width ?? size,
                    height: height,
                    maxWidth: maxWidth ?? max,
                    maxHeight: maxHeight ?? max,
                    crop: crop,
                    quality: quality
                ).ConfigureAwait(false);
            }

            if (result.StatusCode == HttpStatusCode.NotFound)
            {
                result.Dispose();
                result = await ProcessNotFound(
                    size: size,
                    max: max,
                    maxWidth: maxWidth,
                    maxHeight: maxHeight,
                    width: width,
                    height: height,
                    crop: null,
                    quality: quality
                ).ConfigureAwait(false);

                if (result == null)
                {
                    return NotFound();
                }
            }

            if ((int)result.StatusCode > 499)
            {
                result.Dispose();

                var isTransform = size.HasValue || max.HasValue || maxWidth.HasValue || maxHeight.HasValue ||
                                  width.HasValue || height.HasValue || !string.IsNullOrEmpty(crop) || quality.HasValue;
                if (isTransform)
                {
                    return RedirectToCdn(list, documentId, DateTimeOffset.UtcNow.AddDays(1),
                        "xformErr=true&correlationId=" + this._appCtx.TraceContext?.CorrelationId);
                }

                throw new InvalidOperationException();
            }

            var ct = result.Content.Headers.ContentType?.MediaType;
            if (ct == "text/json" || string.IsNullOrEmpty(ct))
            {
                ct = "image/jpeg";
            }

            if ((int)result.StatusCode > 299 && (int)result.StatusCode < 400)
            {
                return new CmsRedirectResult(result);
            }

            var stream = await result.Content.ReadAsStreamAsync();
            return new MyFileStreamResult(stream, ct, null,
                result.Content.Headers.LastModified,
                range: result.Content.Headers.ContentRange?.ToString());
        }

		private static string GetDocumentNameForContent(string pathInfo)
        {
	        if(pathInfo.IsNullOrEmpty()) return string.Empty;

	        return pathInfo.Contains('/') 
		        ? HttpUtility.UrlEncode(pathInfo.Replace('/', '\\')) 
		        : pathInfo;
        }

        private async Task<HttpResponseMessage> ProcessNotFound(
            int? size = null,
            int? max = null,
            int? maxWidth = null,
            int? maxHeight = null,
            int? width = null,
            int? height = null,
            string crop = null,
            int? quality = null)
        {
            HttpResponseMessage result;
            var th = Request.GetTypedHeaders();
            if (!th.Accept.Any(x =>
                    x.MediaType != null && x.MediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)))
            {
                return null;
            }

            if (!this.SbApiContext.SiteId.HasValue)
            {
                var tenant = _tenantLookup.GetOrAdd(this.SbApiContext.TenantId, LookupTenant);
                var site = tenant.Sites.Where(s =>
                {
                    if (this.SbApiContext.MasterCatalogId.HasValue &&
                        this.SbApiContext.MasterCatalogId.Value != s.MasterCatalogId.Value)
                    {
                        return false;
                    }

                    if (this.SbApiContext.CatalogId.HasValue && this.SbApiContext.CatalogId.Value != s.CatalogId.Value)
                    {
                        return false;
                    }

                    return true;
                }).FirstOrDefault();
                if (site != null)
                {
                    ((ApiContext)this.SbApiContext).CatalogId = site.CatalogId;
                    ((ApiContext)this.SbApiContext).MasterCatalogId = site.MasterCatalogId;
                    ((ApiContext)this.SbApiContext).SiteId = site.Id;
                }
            }

            if (!this.SbApiContext.SiteId.HasValue)
            {
                return null;
            }

            var genSettingsTask = await _generalSettingsWebApiClient.Value.CloneWithoutUserClaims().GetGeneralSettings()
                .ConfigureAwait(false);
            if (genSettingsTask.HasException)
            {
                return null;
            }

            var genSettings = genSettingsTask.ReadAsSync();

            if (string.IsNullOrEmpty(genSettings.MissingImageSubstitute))
            {
                return null;
            }


            if (Guid.TryParse(genSettings.MissingImageSubstitute, out var guid))
            {
                result = await _docRepo.TransformDocumentContent(
                    headers: new Dictionary<string, string>(),
                    documentListName: "files@mozu",
                    documentId: genSettings.MissingImageSubstitute,
                    width: width ?? size,
                    height: height,
                    maxWidth: maxWidth ?? max,
                    maxHeight: maxHeight ?? max,
                    crop: crop,
                    quality: quality
                ).ConfigureAwait(false);
            }
            else
            {
                result = await _docRepo.TransformTreeDocumentContent(
                    headers: new Dictionary<string, string>(),
                    documentListName: "files@mozu",
                    documentName: genSettings.MissingImageSubstitute,
                    width: width ?? size,
                    height: height,
                    maxWidth: maxWidth ?? max,
                    maxHeight: maxHeight ?? max,
                    crop: crop,
                    quality: quality
                ).ConfigureAwait(false);
            }

            if (result.IsSuccessStatusCode)
            {
                ClientCacheHeadersAttribute.Set404(Request);
                return result;
            }
            else
            {
                try
                {
                    result.Dispose();
                }
                catch
                {
                }

                return null;
            }
        }

        IActionResult RedirectToCdn(string list, string documentId, DateTimeOffset timeStamp,
            string queryOverride = null)
        {
            var cdnHost = this._settings.AppSettings("CdnHost");
            var originalUri = new Uri(PageContext.Url);
            var originalQuery = HttpUtility.ParseQueryString(originalUri.Query);
            var isLatestRequest = string.Equals(originalQuery["latest"], "true", StringComparison.OrdinalIgnoreCase);

            originalQuery.Remove("latest");
            originalQuery["_mzts"] = timeStamp.Ticks.ToString();
            if (isLatestRequest)
            {
                var latestRedirectUrl = new UriBuilder(originalUri) { Query = originalQuery.ToString() };
                return new Microsoft.AspNetCore.Mvc.RedirectResult(latestRedirectUrl.ToString(), false);
            }

            var ub = new UriBuilder();
            ub.Scheme = this.PageContext.IsSecure ? "https" : "http";
            ub.Host = cdnHost;


            ub.Path = string.Equals(list, "files@mozu", StringComparison.OrdinalIgnoreCase)
                ? $"{this.SbApiContext.TenantId}-m{this.SbApiContext.MasterCatalogId.GetValueOrDefault(1)}/cms/files/{documentId}"
                : $"{this.SbApiContext.TenantId}-{(this.SbApiContext.SiteId.HasValue ? this.SbApiContext.SiteId.Value.ToString() : "m-" + this.SbApiContext.MasterCatalogId.GetValueOrDefault(1))}/cms/{list}/{documentId}";
            ub.Query = queryOverride ?? originalQuery.ToString();


            return new Microsoft.AspNetCore.Mvc.RedirectResult(ub.ToString(), true);
        }

        string GetContentType(string fileName)
        {
            var fileExtension = Path.GetExtension(fileName);
            switch (fileExtension)
            {
                case ".txt":
                    return "text/plain";
                case ".doc":
                    return "application/ms-word";
                case ".xls":
                    return "application/vnd.ms-excel";
                case ".gif":
                    return "image/gif";
                case ".jpg":
                case "jpeg":
                    return "image/jpeg";
                case ".bmp":
                    return "image/bmp";
                case ".wav":
                    return "audio/wav";
                case ".ppt":
                    return "application/mspowerpoint";
                case ".dwg":
                    return "image/vnd.dwg";
                default:
                    return "application/octet-stream";
            }
        }

        class MyFileStreamResult : FileStreamResult
        {
            private readonly string _fileName;

            public MyFileStreamResult(Stream stream, string contentType, string etag, DateTimeOffset? lastModifiedDate,
                string fileName = null, string range = null)
                : base(stream, contentType)
            {
                _fileName = fileName;
                Etag = etag;
                LastModifiedDate = lastModifiedDate;
                Range = range;
            }

            protected override void WriteFile(HttpResponse response)
            {
                processFileName(response);
                response.Headers.Add("Cache-Control", "public,max-age=86400");
                base.WriteFile(response);
            }

            void processFileName(HttpResponse response)
            {
                if (_fileName != null)
                {
                    response.Headers.Add("Content-Disposition", "attachment; filename=" + _fileName);
                }
            }
        }

        private class NotModifiedResult : IActionResult
        {
            public Task ExecuteResultAsync(ActionContext context)
            {
                context.HttpContext.Response.StatusCode = 304;
                return Task.CompletedTask;
            }
        }
    }


    public class ContentFetcher : ServiceClientMessageHandler
    {
        private readonly HttpClient _httpClient;
        private readonly IApiContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private ApiContextMessageHandler _handler;

        public ContentFetcher(HttpClient httpClient,
            IApiContext context,
            ISettings settings,
            IClientCacheProvider cacheFactory = null,
            IEnumerable<IOutboundRequestHandler> outputRequestHandlers = null) : base(context, settings, cacheFactory,
            outputRequestHandlers)
        {
            _httpClient = httpClient;
            _context = (ApiContext)context.Clone();
            _handler = new ApiContextMessageHandler(_ctx);
        }

        public ApiContext InnerContext => (ApiContext)_context;

        public string ServiceId
        {
            get { return "DocumentListWebApi"; }
        }

        public Task<HttpResponseMessage> TransformDocumentContent(
            Dictionary<string, string> headers,
            string documentListName,
            string documentId,
            int? width = null,
            int? height = null,
            int? max = null,
            int? maxWidth = null,
            int? maxHeight = null,
            string crop = null,
            int? quality = null,
            CancellationToken cancellationToken = default)
        {
            var relpath = Format(documentListName, false) + "/documents/" + Format(documentId, false) +
                          "/transform?width=" + Format(width, true) + "&height=" + Format(height, true) + "&maxWidth=" +
                          Format(maxWidth, true) + "&maxHeight=" + Format(maxHeight, true) + "&crop=" +
                          Format(crop, true) + "&quality=" + Format(quality, true);
            var requestInfo =
                GenerateRequestUrlInfo(relpath, ServiceId, this.ApiContext?.MozuInstanceId, new ConfigOptions());
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("GET"),
                RequestUri = new Uri(requestInfo.Url)
            };
            InitRequest(request);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            return _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        }


        public virtual Task<HttpResponseMessage> TransformTreeDocumentContent(
            Dictionary<string, string> headers,
            string documentListName,
            string documentName,
            int? width = null,
            int? height = null,
            int? max = null,
            int? maxWidth = null,
            int? maxHeight = null,
            string crop = null,
            int? quality = null,
            string responseFields = null,
            CancellationToken cancellationToken = default)
        {
            var relpath = Format(documentListName, false) + "/documentTree/" + Format(documentName, false) +
                          "/transform?width=" + Format(width, true) + "&height=" + Format(height, true) + "&maxWidth=" +
                          Format(maxWidth, true) + "&maxHeight=" + Format(maxHeight, true) + "&crop=" +
                          Format(crop, true) + "&quality=" + Format(quality, true) + "&responseFields=" +
                          Format(responseFields, true);
            var requestInfo =
                GenerateRequestUrlInfo(relpath, ServiceId, this.ApiContext?.MozuInstanceId, new ConfigOptions());
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("GET"),
                RequestUri = new Uri(requestInfo.Url)
            };
            InitRequest(request);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            return _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        }

        public virtual Task<HttpResponseMessage> GetDocumentContentHead(
            Dictionary<string, string> headers,
            string documentListName, string documentId, string includeInactive = null, string responseFields = null,
            TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified,
            CancellationToken cancellationToken = default)
        {
            var relpath = Format(documentListName, false) + "/documents/" + Format(documentId, false) +
                          "/content?includeInactive=" + Format(includeInactive, true) + "&responseFields=" +
                          Format(responseFields, true);
            var requestInfo =
                GenerateRequestUrlInfo(relpath, ServiceId, this.ApiContext?.MozuInstanceId, new ConfigOptions());
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("GET"),
                RequestUri = new Uri(requestInfo.Url)
            };
            InitRequest(request);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            return _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        }

        public virtual Task<HttpResponseMessage> GetTreeDocumentContentHead(Dictionary<string, string> headers,
            string documentListName, string documentName, string responseFields = null,
            TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified,
            CancellationToken cancellationToken = default)
        {
            var relpath = Format(documentListName, false) + "/documentTree/" + Format(documentName, false) +
                          "/content?responseFields=" + Format(responseFields, true);
            var requestInfo =
                GenerateRequestUrlInfo(relpath, ServiceId, this.ApiContext?.MozuInstanceId, new ConfigOptions());
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("GET"),
                RequestUri = new Uri(requestInfo.Url)
            };
            InitRequest(request);
            foreach (var header in headers)
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            return _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        }

        public override void InitRequest(HttpRequestMessage request)
        {
            _handler.InitRequest(request);
        }

        string Format(object obj, bool forQS)
        {
            if (obj == null)
                return null;
            string str = null;
            //todo? other object types
            if (obj is DateTime)
            {
                str = ((DateTime)obj).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.FFFZ");
            }
            else
            {
                str = obj.ToString();
            }

            if (forQS)
            {
                return System.Web.HttpUtility.UrlEncode(str);
            }

            return System.Web.HttpUtility.UrlPathEncode(str);
        }
    }

    class CmsRedirectResult : ActionResult
    {
        private readonly HttpResponseMessage _message;
        private readonly HttpStatusCode _statuscode;
        private readonly HttpResponseHeaders _headers;

        public CmsRedirectResult(HttpResponseMessage message)
        {
            _statuscode = message.StatusCode;
            _headers = message.Headers;
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            context.HttpContext.Response.StatusCode = (int)_statuscode;
            foreach (var header in _headers)
            {
                context.HttpContext.Response.Headers[header.Key] = header.Value.Join(";");
            }

            return Task.CompletedTask;
        }
    }
}