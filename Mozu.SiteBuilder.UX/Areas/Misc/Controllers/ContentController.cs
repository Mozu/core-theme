using System;
using System.Collections.Concurrent;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class ContentController : ApiControllerBase
    {
        //private static string NotFoundImage = "/admin/scripts/resources/images/noimage.png";

        private static readonly ConcurrentDictionary<int, Site> _siteLookup = new ConcurrentDictionary<int, Site>();
        private static long g_quality = 60;
        private IApiContext _appCtx;
        private IDocumentListWebApiClient _docRepo;

        public ContentController(IDocumentListWebApiClient docRepo, IApiContext appCtx)
        {
            // SuppressMissingContextRedirect = true;
            _docRepo = docRepo.CloneWith(x => { x.SiteId = null; });

            _appCtx = appCtx;
            ((ServiceClientBase) _docRepo).Options.MaxSize = int.MaxValue;
        }

        //
        // GET:/Img/


        private static ImageCodecInfo GetEncoderInfo(String mimeType)
        {
            return ImageCodecInfo.GetImageEncoders().FirstOrDefault(t => t.MimeType == mimeType);
        }


        private Site LookupSite(int siteid)
        {
            ISitesWebApiClient client = Request.Resolve<ISitesWebApiClient>().CloneWithoutUserClaims();
            ServiceClientResponse<Site> siteRes = client.GetSite(siteid, false).Result;
            if (siteRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
            return siteRes.ReadAsSync();
        }


        [ClientCacheHeaders(ConfigKey = "images")]
        [HttpGet()]
        public async Task<ActionResult> Index(
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
            string crop = null)
        {
            //todo send out appoligy letter

            ApiContext context = null;

            _docRepo = _docRepo.CloneWithApiContext(x =>
            {
                context = x;
                if (site.HasValue)
                {
                    Site siteLookup = _siteLookup.GetOrAdd(site.Value, LookupSite);
                    if (siteLookup == null)
                    {
                        throw new FileNotFoundException("cant find site:" + site);
                    }
                    context.TenantId = siteLookup.TenantId;
                    context.MasterCatalogId = siteLookup.MasterCatalogId;
                    context.CatalogId = siteLookup.CatalogId;
                    context.SiteId = siteLookup.Id;
                    context.LocaleCode = siteLookup.DefaultLocaleCode;
                    //   context.SiteId = tmp;
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
            });
            Guid guid;
            ServiceClientResponse<StreamContent> result = null;
            if (Request.Headers.IfModifiedSince.HasValue)
            {
                if (Guid.TryParse(documentId, out guid))
                {
                    result = await _docRepo.GetDocumentContentHead(list, documentId).ConfigureAwait(false);
                }
                else
                {
                    result = await _docRepo.GetTreeDocumentContentHead(list, documentId).ConfigureAwait(false);
                }
                if (result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }
                if (result.HasException)
                {
                    throw result.ReadException();
                }

                if (Request.Headers.IfModifiedSince.Value >= result.ResponseMessage.Content.Headers.LastModified.Value)
                {
                    return new NotModifiedResult();
                }
            }
            
            _docRepo.Options.CompletionOption = System.Net.Http.HttpCompletionOption.ResponseHeadersRead;
            if (Guid.TryParse(documentId, out guid))
            {
                result = await _docRepo.TransformDocumentContent(
                    list,
                    documentId,
                    width: width.HasValue ? width : size,
                    height:height,
                    maxWidth: maxWidth.HasValue? maxWidth : max,
                    maxHeight: maxHeight,
                    crop: crop
                    ).ConfigureAwait(false);
            }
            else
            {
                result = await _docRepo.TransformTreeDocumentContent(
                    list,
                    documentId,
                    width: width.HasValue ? width : size,
                    height: height,
                    maxWidth: maxWidth.HasValue ? maxWidth : max,
                    maxHeight: maxHeight,
                    crop: crop
                    ).ConfigureAwait(false);
            }
            if (result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                result.ResponseMessage.Dispose();
                return new NotFoundResult();
            }
            if (result.HasException)
            {
                result.ResponseMessage.Dispose();
                throw result.ReadException();
            }
            string ct = result.ResponseMessage.Content.Headers.ContentType != null
                ? result.ResponseMessage.Content.Headers.ContentType.MediaType
                : null;
            if (ct == "text/json" || string.IsNullOrEmpty(ct))
            {
                ct = "image/jpeg";
            }
            return new MyFileStreamResult(result.ResponseMessage.Content.ReadAsStreamAsync().Result, ct, null,
                result.ResponseMessage.Content.Headers.LastModified);
        }


        private string GetContentType(string fileName)
        {
            string fileExtension = Path.GetExtension(fileName);
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


        private class MyFileStreamResult : FileStreamResult
        {
            private readonly string _fileName;
            private string ct;
            private DateTimeOffset? nullable;
            private string p;
            private Stream stream;


            public MyFileStreamResult(Stream stream, string contentType, string etag, DateTimeOffset? LastModifiedDate,
                string fileName = null)
                : base(stream, contentType)
            {
                _fileName = fileName;
                Etag = etag;
                this.LastModifiedDate = LastModifiedDate;
            }

            protected override void WriteFile(HttpResponseBase response)
            {
                processFileName(response);
                response.Cache.SetCacheability(HttpCacheability.Public);
                response.Cache.SetExpires(DateTime.Now.AddDays(1));
                base.WriteFile(response);
            }

            private void processFileName(HttpResponseBase response)
            {
                if (_fileName != null)
                {
                    response.AddHeader("Content-Disposition", "attachment; filename=" + _fileName);
                }
            }
        }


        private class NotModifiedResult : ActionResult
        {
            public override void ExecuteResult(HttpRequestMessage requestMessage)
            {
                HttpResponseBase response = requestMessage.HttpContext().Response;
                response.StatusCode = 304;
            }
        }
    }
}