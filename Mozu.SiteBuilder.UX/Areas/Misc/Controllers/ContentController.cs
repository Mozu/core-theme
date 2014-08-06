using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
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

using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class ContentController : BaseApiController
    {
        IDocumentListWebApiClient _docRepo;
        IApiContext _appCtx;
        private static ConcurrentDictionary<int, Mozu.Tenant.Contracts.Site> _siteLookup = new ConcurrentDictionary<int, Tenant.Contracts.Site>();
        public ContentController(IDocumentListWebApiClient docRepo, IApiContext appCtx)
        {
            // SuppressMissingContextRedirect = true;
            _docRepo = docRepo.CloneWith(x => { x.SiteId = null; });

            _appCtx = appCtx;
            ((ServiceClientBase)_docRepo).Options.MaxSize = int.MaxValue;
        }
        //
        // GET:/Img/


        Stream ResizeToMaxDimension(Stream stream, int maxSize)
        {
            var initPos = stream.Position;
            var mf = new MyStream(stream);
            var origImage = System.Drawing.Image.FromStream(mf);
            var ratio = (decimal)maxSize / (decimal)Math.Max(origImage.Width, origImage.Height);
            if (ratio < 1)
            {
                stream = Resize(origImage, Convert.ToInt32(origImage.Width * ratio), Convert.ToInt32(origImage.Height * ratio), false);
                stream.Position = 0;
            }
            else
            {
                stream.Position = initPos;
            }

            return stream;
        }
        Stream Resize(Stream stream, int size)
        {
            //  var bytes  = new byte[stream.Length ];
            // stream.Read(bytes, 0, bytes.Length);
            var initPos = stream.Position;
            var mf = new MyStream(stream);

            var origImage = System.Drawing.Image.FromStream(mf);
            // var origImage = System.Drawing.Image.FromStream(stream);
            var ratio = (decimal)size / (decimal)origImage.Height;
            if (ratio < 1)
            {
                int newWidth = Convert.ToInt32(origImage.Width * ratio);
                int newHeight = size;

                stream = Resize(origImage, newWidth, newHeight, false);
                stream.Position = 0;
            }
            else
            {
                stream.Position = initPos;
            }

            return stream;

        }
        static long g_quality = 60;
        Stream Resize(Image img, int width, int height, bool isPng)
        {

            using (Bitmap b = new Bitmap(width, height))
            {


                using (Graphics g = Graphics.FromImage(b))
                {
                    var ia = new ImageAttributes();

                    if (isPng)
                    {
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



                    string codec = isPng ? "image/png" : "image/jpeg";
                    ImageCodecInfo codecInfo = GetEncoderInfo(codec);
                    System.Drawing.Imaging.Encoder qualityEncoder = System.Drawing.Imaging.Encoder.Quality;

                    EncoderParameter ratio = new EncoderParameter(qualityEncoder, g_quality);
                    EncoderParameters codecParams = new EncoderParameters(1);
                    codecParams.Param[0] = ratio;
                    MemoryStream ms = new MemoryStream();
                    b.Save(ms, codecInfo, codecParams);
                    ms.Position = 0;
                    return ms;
                }
            }
        }

        static ImageCodecInfo GetEncoderInfo(String mimeType)
        {
            return ImageCodecInfo.GetImageEncoders().FirstOrDefault(t => t.MimeType == mimeType);
        }

        string GetDirectoryString(ApiContext ctx, string list)
        {
            return System.IO.Path.GetTempPath() + "\\" + ctx.TenantId + "-" + ctx.MasterCatalogId.Value + "-" + ctx.SiteId.GetValueOrDefault(0) + "\\" + list;
        }
        //todo: change as task
        Tuple<string, Stream> GetFromFSCache(ApiContext ctx, string list, string documentId)
        {
            byte[] header = new byte[100];
            var dir = GetDirectoryString(ctx, list);
            var file = dir + "\\" + documentId;
            if (System.IO.File.Exists(file))
            {
                var stream = System.IO.File.OpenRead(file);
                stream.Read(header, 0, 100);
                var sw = new StreamReader(new MemoryStream(header), System.Text.Encoding.UTF8);
                var ct = sw.ReadLine();
                return new Tuple<string, Stream>(ct, stream);
            }
            return null;
        }
        private Tuple<string, Stream> AddToFSCache(ApiContext ctx, string list, string documentId, System.Net.Http.HttpContent content)
        {
            var ct = content.Headers.ContentType.MediaType;

            byte[] header = new byte[100];
            var ms = new MemoryStream(header);
            var sw = new StreamWriter(ms, System.Text.Encoding.UTF8);
            sw.WriteLine(ct ?? "");
            sw.Flush();


            var dir = GetDirectoryString(ctx, list);
            var file = dir + "\\" + documentId;
            System.IO.Directory.CreateDirectory(dir);
            using (var fs = System.IO.File.Create(file))
            {
                fs.Write(header, 0, header.Length);
                var cStream = content.ReadAsStreamAsync().Result;
                cStream.CopyTo(fs);
                fs.Flush();
            }



            return GetFromFSCache(ctx, list, documentId);

        }

        private Tenant.Contracts.Site LookupSite(int siteid)
        {
            var client = this.Request.Resolve<ISitesWebApiClient>().CloneWithoutUserClaims();
            var siteRes = client.GetSite(siteid, false).Result;
            if (siteRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
            return siteRes.ReadAsSync();

        }

        [ClientCacheHeaders(ConfigKey = "images")]
        [System.Web.Http.HttpGet]
        public ActionResult Index(int? tenant = null, int? mastercat = null, int? site = null, string list = "files@mozu.com", string documentId = null, int size = 0, int max = 0)
        {



            //for local dev testing...
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

            });


            try
            {
                Semaphore mutex = null;
                Tuple<string, Stream> tpl = null;
                try
                {
                    tpl = GetFromFSCache(context, list, documentId);
                    if (tpl == null)
                    {
                        var mutexName = (context.TenantId + ";" + context.MasterCatalogId.Value + ";" + list + ";" + documentId).ToLowerInvariant();

                        mutex = new Semaphore(1, 1, mutexName);
                        if (!mutex.WaitOne(10000))
                        {
                            mutex = null;
                        }
                        tpl = GetFromFSCache(context, list, documentId);
                        if (tpl == null)
                        {

                            ServiceClientResponse<StreamContent> docContextRes = null;
                            Guid guidId;
                            if (Guid.TryParse(documentId, out guidId))
                            {
                                docContextRes = _docRepo.GetDocumentContent(list, documentId).Result;
                            }
                            else
                            {
                                docContextRes = _docRepo.GetTreeDocumentContent(list, documentId).Result;
                            }



                            if (docContextRes.ResponseMessage.IsSuccessStatusCode)
                            {
                                tpl = AddToFSCache(context, list, documentId, docContextRes.ResponseMessage.Content);
                            }
                            else
                            {
                                return Redirect("http://www.petsonline.com.my/includes/tng/styles/img_not_found.gif");
                            }
                            // var content = _docRepo.GetDocumentContent(list, documentId).Result.ResponseMessage.Content;

                        }

                    }
                }
                finally
                {
                    if (mutex != null)
                    {
                        mutex.Release(1);

                    }
                }




                var ct = tpl.Item1;

                if (ct == "text/json" || string.IsNullOrEmpty(ct))
                {
                    ct = "image/jpeg";
                }

                var stream = tpl.Item2;
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
                var res = new MyFileStreamResult(stream, ct);
                return res;

            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex);
                return Redirect("http://www.petsonline.com.my/includes/tng/styles/img_not_found.gif");
            }

        }

        class MyStream : Stream
        {
            Stream _s;
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

            public override void Flush()
            {
                _s.Flush();
            }

            public override long Length
            {
                get { return _s.Length; }
            }

            public override long Position
            {
                get { return _s.Position; }
                set
                {
                    throw new NotImplementedException();
                }
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
        [System.Web.Http.HttpGet]
        public ActionResult Download(string list, string documentId)
        {
            var doc = _docRepo.GetDocument(documentListName: list, documentId: documentId).Result.ReadAsSync();
            var content = _docRepo.GetDocumentContent(list, documentId).Result.ResponseMessage.Content;
            var stream = content.ReadAsStreamAsync().Result;

            return new MyFileStreamResult(stream, GetContentType(doc.Name), doc.Name);
            //var stream = content.ReadAsStreamAsync().Result;

        }
        string GetContentType(string fileName)
        {
            var fileExtension = System.IO.Path.GetExtension(fileName);
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
            string _fileName;
            public MyFileStreamResult(Stream fileStream, string contentType, string fileName = null)
                : base(fileStream, contentType)
            {
                _fileName = fileName;

            }

            protected override void WriteFile(HttpResponseBase response)
            {
                processFileName(response);
                response.Cache.SetCacheability(HttpCacheability.Public);
                response.Cache.SetExpires(DateTime.Now.AddDays(1));
                base.WriteFile(response);
            }
            void processFileName(HttpResponseBase response)
            {
                if (_fileName != null)
                {
                    response.AddHeader("Content-Disposition", "attachment; filename=" + _fileName);

                }
            }



        }

    }
}
