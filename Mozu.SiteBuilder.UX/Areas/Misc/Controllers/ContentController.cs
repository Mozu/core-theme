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
        private static byte[] OnePixelGif = Convert.FromBase64String(@"R0lGODlhAQABAPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAABAAEAAAgEAP8FBAA7");

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


        private Stream ResizeToMaxDimension(Stream stream, int maxSize)
        {
            long initPos = stream.Position;
            var mf = new MyStream(stream);
            Image origImage = Image.FromStream(mf);
            decimal ratio = maxSize/(decimal) Math.Max(origImage.Width, origImage.Height);
            if (ratio < 1)
            {
                stream = Resize(origImage, Convert.ToInt32(origImage.Width*ratio), Convert.ToInt32(origImage.Height*ratio));
                stream.Position = 0;
            }
            else
            {
                stream.Position = initPos;
            }

            return stream;
        }

        private Stream Resize(Stream stream, int size)
        {
            //  var bytes  = new byte[stream.Length ];
            // stream.Read(bytes, 0, bytes.Length);
            long initPos = stream.Position;
            var mf = new MyStream(stream);

            Image origImage = Image.FromStream(mf);
            // var origImage = System.Drawing.Image.FromStream(stream);
            decimal ratio = size/(decimal) origImage.Height;
            if (ratio < 1)
            {
                int newWidth = Convert.ToInt32(origImage.Width*ratio);
                int newHeight = size;
                using (stream)
                {
                    return Resize(origImage, newWidth, newHeight);
                }
            }
            stream.Position = initPos;

            return stream;
        }

        private Stream Resize(Image img, int width, int height)
        {
            var allowTransparency = img != null && img.RawFormat != null && img.RawFormat.Guid == ImageFormat.Png.Guid;

            using (var b = new Bitmap(width, height))
            {
                using (Graphics g = Graphics.FromImage(b))
                {
                    if (allowTransparency)
                    {
                        var ia = new ImageAttributes();
                        g.Clear(Color.Transparent);
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        ia.SetWrapMode(WrapMode.TileFlipXY);
                        g.DrawImage(img, new Rectangle(0, 0, width, height), 0, 0, img.Width, img.Height, GraphicsUnit.Pixel, ia);
                    }
                    else
                    {
                        g.Clear(Color.White);
                        g.SmoothingMode = SmoothingMode.AntiAlias;
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        g.DrawImage(img, 0, 0, width, height);
                    }

                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    
                    string codec = allowTransparency ? "image/png" : "image/jpeg";
                    ImageCodecInfo codecInfo = GetEncoderInfo(codec);
                    Encoder qualityEncoder = Encoder.Quality;

                    var ratio = new EncoderParameter(qualityEncoder, g_quality);
                    var codecParams = new EncoderParameters(1);
                    codecParams.Param[0] = ratio;
                    var ms = new MemoryStream();
                    b.Save(ms, codecInfo, codecParams);
                    ms.Position = 0;
                    return ms;
                }
            }
        }

        private static ImageCodecInfo GetEncoderInfo(String mimeType)
        {
            return ImageCodecInfo.GetImageEncoders().FirstOrDefault(t => t.MimeType == mimeType);
        }

        private string GetDirectoryString(ApiContext ctx, string list)
        {
            return Path.GetTempPath() + "\\content_cache\\" + ctx.TenantId + "-" + ctx.MasterCatalogId.Value + "-" + ctx.SiteId.GetValueOrDefault(0) + "\\" + list;
        }

        //todo: change as task
        private async Task<FileSystemResult> GetFromFSCache(ApiContext ctx, string list, string documentId)
        {
            var header = new byte[100];
            string dir = GetDirectoryString(ctx, list);
            string file = dir + "\\" + documentId;
            if (System.IO.File.Exists(file))
            {
                FileStream stream = new FileStream(file, FileMode.Open , FileAccess.Read, FileShare.Write| FileShare.Read | FileShare.Delete);
                 
                await stream.ReadAsync(header, 0, 100);


                return new FileSystemResult
                       {
                           Header = FileHeader.CreateFileHeader(header),
                           Stream = stream
                       };
            }
            return null;
        }

        private async Task<FileSystemResult> AddToFSCache(ApiContext ctx, string list, string documentId, HttpResponseMessage responseMessage)
        {
            HttpContent content = responseMessage.Content;
            string ct = content.Headers.ContentType.MediaType;

            var headerBuffer = new byte[100];


            var header = new FileHeader
                         {
                             ContentType = content.Headers.ContentType.MediaType,
                             Etag = responseMessage.Headers.ETag != null && !string.IsNullOrEmpty(responseMessage.Headers.ETag.Tag) ? responseMessage.Headers.ETag.Tag.Replace("\"", "") : null,
                             LastModified = content.Headers.LastModified
                         };


            var ms = new MemoryStream(headerBuffer);
            header.Write(ms);


            string dir = GetDirectoryString(ctx, list);
            string tempFile = dir + "\\" + Guid.NewGuid().ToString();
         
            string file = dir + "\\" + documentId;

            Directory.CreateDirectory(dir);

            using (FileStream fs = System.IO.File.Create(tempFile))
            {
                ms.Position = 0;
                ms.CopyTo(fs);
                //fs.Write(headerBuffer, 0, headerBuffer.Length);
                Stream cStream = content.ReadAsStreamAsync().Result;
                await cStream.CopyToAsync(fs);
                await fs.FlushAsync();
            }
            try
            {
                bool copied = false;
                try
                {
                    if (!System.IO.File.Exists(file))
                    {
                        System.IO.File.Move(tempFile, file );
                        copied = true;
                    }    
                }
                catch
                {
                    if (!System.IO.File.Exists(file))
                    {
                        throw ;
                    }
                }
                if (!copied)
                {
                    System.IO.File.Copy( tempFile, file, true);
                    System.IO.File.Delete(tempFile);
                }
                

            }
            catch(Exception exception)
            {
                //todo log
                System.Diagnostics.Debug.WriteLine(exception);

            }


            return await GetFromFSCache(ctx, list, documentId);
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

         Task<ServiceClientResponse<System.Net.Http.StreamContent>>  GetDocumentContent ( string list,string idOrName, bool headOnly)
        {
            Guid guidId;
             if ( headOnly)
             {
                 if (Guid.TryParse(idOrName, out guidId))
                 {
                     return _docRepo.GetDocumentContentHead(list, idOrName);
                 }
                 else
                 {
                     return _docRepo.GetTreeDocumentContentHead(list, idOrName);
                 }
             }
             else
             {
                 _docRepo.Options.CompletionOption = HttpCompletionOption.ResponseHeadersRead;
                 if (Guid.TryParse(idOrName, out guidId))
                 {
                     return _docRepo.GetDocumentContent(list, idOrName);
                 }
                 else
                 {
                     return _docRepo.GetTreeDocumentContent(list, idOrName);
                 }
             }
            
        }

        [ClientCacheHeaders(ConfigKey = "images")]
        [HttpGet]
        public async Task<ActionResult> Index(int? tenant = null, int? mastercat = null, int? site = null, string list = "files@mozu.com", string documentId = null, int size = 0, int max = 0)
        {
            //todo send out appoligy letter

            ApiContext context;
            InitCmsClient(tenant, mastercat, site, out context);
            Semaphore mutex = null;
            FileSystemResult tpl = null;
            try
            {
                string mutexName = (context.TenantId + ";" + context.MasterCatalogId.Value + ";" + list + ";" + documentId).ToLowerInvariant();

                //move to file system access.
                mutex = new Semaphore(1, 1, mutexName);

                if (!mutex.WaitOne(10000))
                {
                    mutex = null;
                }

                tpl = await GetFromFSCache(context, list, documentId);

                
                Guid guidId;

                if (tpl != null&& tpl.Header.LastModified.HasValue)
                {

                    //future support for not modifye
                    _docRepo.Options.AdditionalHeaders.Add("If-Modified-Since", tpl.Header.LastModified.Value.ToString("r"));
                    if (!string.IsNullOrEmpty(tpl.Header.Etag))
                    {
                        _docRepo.Options.AdditionalHeaders.Add("If-None-Match", tpl.Header.Etag);
                    }


                    var docContextHeadRes = await GetDocumentContent(list, documentId, true);
                    
                    //not found or errored in some way return not found
                    if (((int)docContextHeadRes.ResponseMessage.StatusCode) >= 400)  //<change to <= 400
                    {
                        return new NotFoundResult();
                    }

                    //if  last modified is less then get the content and kill the image
                    if (
                        docContextHeadRes.ResponseMessage.StatusCode != HttpStatusCode.NotModified
                    &&
                        (
                            docContextHeadRes.ResponseMessage.Content == null ||
                            !docContextHeadRes.ResponseMessage.Content.Headers.LastModified.HasValue||
                            docContextHeadRes.ResponseMessage.Content.Headers.LastModified > tpl.Header.LastModified
                        )
                    )
                    {
                        tpl.Stream.Dispose();
                        tpl = null;
                    }
                }
                //cache wasnt found or was invalidated above
                if (tpl == null)
                {
                    var docContextRes = await GetDocumentContent(list, documentId, false);
                    if (!docContextRes.ResponseMessage.IsSuccessStatusCode)
                    {
                        docContextRes.ResponseMessage.Dispose();
                        return new NotFoundResult();
                    }

                    tpl = await AddToFSCache(context, list, documentId, docContextRes.ResponseMessage);
                }


                if  ( Request.Headers.IfModifiedSince.HasValue && tpl.Header.LastModified.HasValue &&
                    Request.Headers.IfModifiedSince.Value >= tpl.Header.LastModified.Value )
                {
                    return new NotModifiedResult();
                }


                string ct = tpl.Header.ContentType;

                if (ct == "text/json" || string.IsNullOrEmpty(ct))
                {
                    ct = "image/jpeg";
                }

                Stream stream = tpl.Stream;
                if (size > 0)
                {
                    stream = Resize(stream, size);
                    ct = "image/jpeg";
                }
                else if (max > 0)
                {
                    stream = ResizeToMaxDimension(stream, max);
                    ct = "image/jpeg";
                }
                return new MyFileStreamResult(stream, ct, tpl.Header.Etag, tpl.Header.LastModified);
            }

            catch (Exception ex)
            {
                if (tpl != null && tpl.Stream != null)
                {
                    tpl.Stream.Dispose();
                }
               return new NotFoundResult();
               
            }
            finally

            {
                if (
                    mutex != null)
                {
                    mutex.Release(1);
                }
            }
        }

        private void InitCmsClient(int? tenant, int? mastercat, int? site, out ApiContext context)
        {
            ApiContext  ctx= null;
            _docRepo = _docRepo.CloneWithApiContext(x =>
            {
                ctx = x;
                if (site.HasValue)
                {
                    Site siteLookup = _siteLookup.GetOrAdd(site.Value, LookupSite);
                    if (siteLookup == null)
                    {
                        throw new FileNotFoundException("cant find site:" + site);
                    }
                    ctx.TenantId = siteLookup.TenantId;
                    ctx.MasterCatalogId = siteLookup.MasterCatalogId;
                    ctx.CatalogId = siteLookup.CatalogId;
                    ctx.SiteId = siteLookup.Id;
                    ctx.LocaleCode = siteLookup.DefaultLocaleCode;
                    //   context.SiteId = tmp;
                }
                if (mastercat.HasValue)
                {
                    ctx.MasterCatalogId = mastercat.Value;
                }
                if (tenant.HasValue)
                {
                    ctx.TenantId = tenant.Value;
                }
                ctx.UserClaims = null;
            });
            _docRepo.Options.AdditionalHeaders = _docRepo.Options.AdditionalHeaders ?? new NameValueCollection();
            context = ctx;
           
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

        public class FileHeader
        {
            public string ContentType { get; set; }
            public DateTimeOffset? LastModified { get; set; }

            public string Etag { get; set; }

            public static FileHeader CreateFileHeader(byte[] buff)
            {
                var stream = new MemoryStream(buff);
                var fh = new FileHeader();
                var br = new BinaryReader(stream);
                fh.ContentType = br.ReadString();
                fh.Etag = br.ReadString();
                fh.LastModified = new DateTimeOffset(new DateTime(br.ReadInt64(), DateTimeKind.Utc));
                return fh;
            }

            public void Write(Stream str)
            {
                var bw = new BinaryWriter(str);
                bw.Write(ContentType);
                bw.Write(Etag ?? "");
                bw.Write(LastModified.HasValue ? LastModified.Value.UtcTicks : DateTime.MinValue.ToUniversalTime().Ticks);

                bw.Flush();
            }
        }

        public class FileSystemResult
        {
            public Stream Stream { get; set; }
            public FileHeader Header { get; set; }
        }

        private class MyFileStreamResult : FileStreamResult
        {
            private readonly string _fileName;
            private string ct;
            private DateTimeOffset? nullable;
            private string p;
            private Stream stream;


            public MyFileStreamResult(Stream stream, string contentType, string etag, DateTimeOffset? LastModifiedDate, string fileName = null)
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

        private class MyStream : Stream
        {
            private readonly Stream _s;

            public MyStream(Stream s)
            {
                _s = s;
            }

            public override bool CanRead
            {
                get { return true; }
            }

            public override bool CanSeek
            {
                get { return false; }
            }

            public override bool CanWrite
            {
                get { return false; }
            }

            public override long Length
            {
                get { return _s.Length; }
            }

            public override long Position
            {
                get { return _s.Position; }
                set { throw new NotImplementedException(); }
            }

            public override void Flush()
            {
                _s.Flush();
            }

            public override int Read(byte[] buffer, int offset, int count)
            {
                return _s.Read(buffer, offset, count);
            }

            public override long Seek(long offset, SeekOrigin origin)
            {
                throw new NotImplementedException();
            }

            public override void SetLength(long value)
            {
                throw new NotImplementedException();
            }

            public override void Write(byte[] buffer, int offset, int count)
            {
                throw new NotImplementedException();
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