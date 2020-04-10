using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Configuration;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using System;
using System.Collections.Concurrent;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Mozu.SiteBuilder.Mvc.Middleware;
using FileStreamResult = Mozu.SiteBuilder.Mvc.ActionResults.FileStreamResult;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    [NoCookieFilter]
    public class ContentController : ApiControllerBase
    {
        static readonly ConcurrentDictionary<int, Site> _siteLookup = new ConcurrentDictionary<int, Site>();
        static readonly ConcurrentDictionary<int, Tenant.Contracts.Tenant> _tenantLookup = new ConcurrentDictionary<int, Tenant.Contracts.Tenant>();
        //static long Quality = 60;
        IApiContext _appCtx;
        readonly ISettings _settings;
        IDocumentListWebApiClient _docRepo;
        Lazy<IGeneralSettingsWebApiClient> _generalSettingsWebApiClient;

        public ContentController(IDocumentListWebApiClient docRepo, IApiContext appCtx, ISettings settings, Lazy<IGeneralSettingsWebApiClient> generalSettingsWebApiClient)
        {
            _docRepo = docRepo.CloneWithApiContext(x => x.SiteId = null);
            _appCtx = appCtx;
            _settings = settings;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            ((ServiceClientBase)_docRepo).Options.MaxSize = int.MaxValue;
        }

        //static ImageCodecInfo GetEncoderInfo(string mimeType)
        //{
        //    return ImageCodecInfo.GetImageEncoders().FirstOrDefault(t => t.MimeType == mimeType);
        //}

        Site LookupSite(int siteid)
        {
            var client = Request.HttpContext.RequestServices.Resolve<ISitesWebApiClient>().CloneWithoutUserClaims();
            var siteRes = client.GetSite(siteid, false).Result;
            return siteRes.ReadAsSync();
        }

        Tenant.Contracts.Tenant LookupTenant(int tenant)
        {
            var client = Request.HttpContext.RequestServices.Resolve<ITenantsWebApiClient>().CloneWithoutUserClaims();
            var res = client.GetTenantInternal(tenant,includeSoftDeletes:false, includeInactiveChildren:false).Result;
            return res.ReadAsSync();
        }

        bool ShouldRedirectToCdn()
        {
            var disableCdn = _settings.AppSettings("disableCDN") == "true";
            var cdnHost = _settings.AppSettings("CdnHost");
            var cdnOriginHost = _settings.AppSettings("CdnOriginHost") ?? "";
            var hasAkamiOriginHop = this.Request.Headers.Any(x => string.Equals(x.Key, "Akamai-Origin-Hop", StringComparison.OrdinalIgnoreCase));
            var uri = new Uri(PageContext.Url);
            return !disableCdn && !string.IsNullOrEmpty(cdnHost) && !cdnOriginHost.EqualsIgnoreCase(uri.Host) && !hasAkamiOriginHop;
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
            int? maxWidth= null,
            int? maxHeight= null,
            int? width = null,
            int? height  = null,
            string crop = null,
            int? quality = null)
        {
            //todo send out appoligy letter

            var shouldRedirectToCdn = ShouldRedirectToCdn();
            var isRewrite = Request.HttpContext.Items.ContainsKey(UrlRewritingMiddleware.IsSeoRewrite) && (bool)Request.HttpContext.Items[UrlRewritingMiddleware.IsSeoRewrite];

           ApiContext context = null;

            _docRepo = _docRepo.CloneWithApiContext(x =>
            {
                context = x;
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
                ((ApiContext)this.SbApiContext).TenantId  = context.TenantId;
                ((ApiContext)this.SbApiContext).MasterCatalogId = context.MasterCatalogId;
                ((ApiContext)this.SbApiContext ).CatalogId = context.CatalogId;
                ((ApiContext)this.SbApiContext).SiteId = context.SiteId;
                ((ApiContext)this.SbApiContext).LocaleCode = context.LocaleCode;


            });
            Guid guid;

            var th = Request.GetTypedHeaders();

            ServiceClientResponse<StreamContent> result = null;
            if (th.IfModifiedSince.HasValue || shouldRedirectToCdn)
            {
                if (Guid.TryParse(documentId, out guid))
                {
                    result = await _docRepo.GetDocumentContentHead(list, documentId).ConfigureAwait(false);
                }
                else
                {
                    result = await _docRepo.GetTreeDocumentContentHead(list, documentId).ConfigureAwait(false);
                }
                
                // we should have a lastmodified header on the HEAD request, but in some odd cases we may not.  if we don't find one then we should serve directly from the CMS.
                if (result.ResponseMessage.StatusCode == HttpStatusCode.NotFound) return NotFound();
                if (result.HasException) throw result.ReadException();
                if (shouldRedirectToCdn && !isRewrite && result.ResponseMessage.Content.Headers.LastModified.HasValue) return RedirectToCdn(list, documentId, result.ResponseMessage.Content.Headers.LastModified.Value);
                if (th.IfModifiedSince.GetValueOrDefault(DateTime.MinValue) >= result.ResponseMessage.Content.Headers.LastModified.GetValueOrDefault(DateTimeOffset.MaxValue)) return StatusCode(304);
            }

            var range = th.Range?.Ranges?.FirstOrDefault();
            if (range?.From.HasValue == true && string.Equals(th.Range.Unit.ToString(), "bytes", StringComparison.OrdinalIgnoreCase))
            {
                _docRepo.Options.AdditionalHeaders ??= new System.Collections.Specialized.NameValueCollection();
                _docRepo.Options.AdditionalHeaders["Range"] = th.Range.ToString();
            }
            
            _docRepo.Options.CompletionOption = HttpCompletionOption.ResponseHeadersRead;
            if (Guid.TryParse(documentId, out guid))
            {
                result = await _docRepo.TransformDocumentContent(
                    list,
                    documentId,
                    width: width ?? size,
                    height:height,
                    maxWidth: maxWidth ?? max,
                    maxHeight: maxHeight ?? max,
                    crop: crop,
                    quality: quality
                    ).ConfigureAwait(false);
            }
            else
            {
                result = await _docRepo.TransformTreeDocumentContent(
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
            if (result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                result.ResponseMessage.Dispose();
                result = await ProcessNotFound(
                    size: size,
                    max: max, 
                    maxWidth: maxWidth,
                    maxHeight:maxHeight,
                    width:width,
                    height:height,
                    crop:null,
                    quality:quality
                    ).ConfigureAwait(false);

                if (result== null)
                {
                    return NotFound();
                }
                
            }
            if (result.HasException)
            {
                result.ResponseMessage.Dispose();
                var ex = result.ReadException();
                var isTransform = size.HasValue || max.HasValue || maxWidth.HasValue || maxHeight.HasValue || width.HasValue || height.HasValue || !string.IsNullOrEmpty(crop) || quality.HasValue;
                if (isTransform) 
                {
                    var apiEx = ex as Mozu.Core.Api.Client.Exceptions.ApiWebClientException;
                    if ( apiEx?.MessageContains("corrupted") == true )
                    {
                         return RedirectToCdn(list, documentId, DateTimeOffset.UtcNow.AddDays(1), "xformErr=true&correlationId=" + this._appCtx.TraceContext?.CorrelationId);
                    }
                }
                throw ex;
            }
            var ct = result.ResponseMessage.Content.Headers.ContentType?.MediaType;
            if (ct == "text/json" || string.IsNullOrEmpty(ct))
            {
                ct = "image/jpeg";
            }
            return new MyFileStreamResult(result.ResponseMessage.Content.ReadAsStreamAsync().Result, ct, null,
                result.ResponseMessage.Content.Headers.LastModified,
                range: result.ResponseMessage.Content.Headers.ContentRange?.ToString());
        }

        private async Task<ServiceClientResponse<StreamContent>> ProcessNotFound(
            int? size = null,
            int? max = null,
            int? maxWidth = null,
            int? maxHeight = null,
            int? width = null,
            int? height = null,
            string crop = null,
            int? quality = null)
        {
            ServiceClientResponse<StreamContent> result;
            var th = Request.GetTypedHeaders();
            if (!th.Accept.Any(x => x.MediaType != null && x.MediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)))
            {
                return null;
            }

            if (!this.SbApiContext.SiteId.HasValue)
            {
                var tenant = _tenantLookup.GetOrAdd(this.SbApiContext.TenantId, LookupTenant);
                var site = tenant.Sites.Where(s =>
                {
                    if (this.SbApiContext.MasterCatalogId.HasValue && this.SbApiContext.MasterCatalogId.Value != s.MasterCatalogId.Value)
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
            if (! this.SbApiContext.SiteId.HasValue)
            {
                return null;
            }
            var genSettingsTask = await _generalSettingsWebApiClient.Value.CloneWithoutUserClaims().GetGeneralSettings().ConfigureAwait(false);
            if ( genSettingsTask.HasException )
            {
                return null;
            }
            var genSettings = genSettingsTask.ReadAsSync();

            if ( string.IsNullOrEmpty(genSettings.MissingImageSubstitute))
            {
                return null;
            }


            if (Guid.TryParse(genSettings.MissingImageSubstitute, out var guid))
            {
                result = await _docRepo.TransformDocumentContent(
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
            if (result.ResponseMessage.IsSuccessStatusCode)
            {
                ClientCacheHeadersAttribute.Set404(Request);
                return result;
            }
            else
            {
                try
                {
                    result.ResponseMessage.Dispose();
                }
                catch { }

                return null;

            }
        }

        IActionResult RedirectToCdn(string list, string documentId, DateTimeOffset timeStamp, string queryOverride = null)
        {
            var cdnHost = this._settings.AppSettings("CdnHost");
            var originalUri = new Uri(PageContext.Url);
            var originalQuery = HttpUtility.ParseQueryString(originalUri.Query);
            var isLatestRequest = string.Equals(originalQuery["latest"], "true", StringComparison.OrdinalIgnoreCase);

            originalQuery.Remove("latest");
            originalQuery["_mzts"] = timeStamp.Ticks.ToString();
            if (isLatestRequest)
            {
                var latestRedirectUrl = new UriBuilder(originalUri) {Query = originalQuery.ToString()};
                return new Microsoft.AspNetCore.Mvc.RedirectResult(latestRedirectUrl.ToString(), false);
            }

            var ub = new UriBuilder();
            ub.Scheme = this.PageContext.IsSecure ? "https" : "http";
            ub.Host = cdnHost;


            ub.Path = string.Equals( list , "files@mozu", StringComparison.OrdinalIgnoreCase)
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

            public MyFileStreamResult(Stream stream, string contentType, string etag, DateTimeOffset? lastModifiedDate, string fileName = null, string range = null)
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
}