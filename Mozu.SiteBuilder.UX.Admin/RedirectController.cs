using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using AutoMapper;
using FiftyOne.Foundation.Mobile.Detection.Matchers;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/redirects", SuppressDescriptorGeneration = true)]
    public class RedirectController : BaseController

    {
        private readonly IRedirectRepository _redirectRepository;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;

        public RedirectController(IRedirectRepository redirectRepository, Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient)
        {
            _redirectRepository = redirectRepository;
            _tenantsWebApiClient = tenantsWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<RedirectEntry>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] bool draft = false)
        {
            var dic = await _redirectRepository.FetchRedirectEntries();
            var tot = dic.Count;
            var list = dic.Values.OrderBy(x => x.Source).Skip(pagingParams.SkipAmount).Take(pagingParams.pageSize.Value).ToList();
            return List2(list, tot);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public Task<Response<List<RedirectEntry>>> Create(List<RedirectEntry> redirects)
        {
            return Edit(redirects);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<RedirectEntry>>> Edit(List<RedirectEntry> redirects)
        {
            redirects.ForEach(x => Validate(x));
            var dic = await _redirectRepository.FetchRedirectEntries();
            EnumerableExtensions.Each(redirects, x => dic[x.Source] = x);

            dic = await _redirectRepository.UpdateRedirectEntries(dic);

            return List2(redirects);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<RedirectEntry>>> Delete(List<RedirectEntry> redirects)
        {
            var dic = await _redirectRepository.FetchRedirectEntries();
            EnumerableExtensions.Each(redirects, x => dic.Remove(x.Source));
            dic = await _redirectRepository.UpdateRedirectEntries(dic);
            return List2(redirects);
        }

        [HttpGetRoute(UriTemplate = "export")]
        public async Task<HttpResponseMessage> Export(int siteid)
        {
            await InitContextFromSite(siteid);
            var ms = new MemoryStream();
            var sw = new StreamWriter(ms);
            var dic = await _redirectRepository.FetchRedirectEntries(siteid);

            sw.WriteLine("source,destination,rewrite,isTemporary,copyQueryStrings");
            EnumerableExtensions.Each(dic.Values, x =>
            {
                EscapeWrite(sw, x.Source);
                sw.Write(',');
                EscapeWrite(sw, x.Destination);
                sw.Write(',');
                sw.WriteLine(x.IsRewrite.GetValueOrDefault(false) ? 1 : 0);
                sw.Write(',');
                sw.WriteLine(x.IsTemporary.GetValueOrDefault(false) ? 1 : 0);
                sw.Write(',');
                sw.WriteLine(x.CopyQueryString.GetValueOrDefault(false) ? 1 : 0);
            });
            sw.Flush();
            ms.Position = 0;

            var resp = Request.CreateResponse(HttpStatusCode.OK);
            resp.Content = new StreamContent(ms);
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
            resp.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            resp.Content.Headers.ContentDisposition.Name = "redirect";
            resp.Content.Headers.ContentDisposition.FileName = "redirects_export.csv";

            return resp;
        }

        void EscapeWrite(TextWriter sw, string inSTr)
        {
            if (inSTr.IndexOf('\"') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr.Replace("\"", "\"\""));
                sw.Write('\"');


            }
            else if (inSTr.IndexOf('\"') > -1 || inSTr.IndexOf(',') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr);
                sw.Write('\"');

            }
            else
            {
                sw.Write(inSTr);
            }

        }

        private void Validate(RedirectEntry entry, int? lineNumber = null)
        {
            bool isValid = true;

            if (string.IsNullOrWhiteSpace(entry.Source) || string.IsNullOrWhiteSpace(entry.Destination))
            {
                isValid = false;
            }
            else
            {
                if (entry.Source[0] == '/')
                {
                    entry.Source = entry.Source.Substring(1);
                }
                if (entry.Destination[0] == '/')
                {
                    entry.Destination = entry.Destination.Substring(1);
                }
            }



            if (!isValid)
            {

                var json = JsonConvert.SerializeObject(entry, Formatting.None);

                if (lineNumber.HasValue)
                {
                    throw new InvalidOperationException(string.Format("invalid entry on line {0}. ({1})", lineNumber.Value, json));
                }
                else
                {
                    throw new InvalidOperationException(string.Format("invalid entry ({0})", json));
                }

            }
        }



        async Task InitContextFromSite(int siteId)
        {
            if (this.SbApiContext.MasterCatalogId.HasValue)
            {
                return;
            }
            var tenant = (await _tenantsWebApiClient.GetTenantInternal(this.SbApiContext.TenantId, false)).ReadAsSync();
            var site = tenant.Sites.First(x => x.Id == siteId);
            var ctx = (SiteBuilderApiContext)this.SbApiContext;

            ctx.MasterCatalogId = site.MasterCatalogId;
            ctx.CatalogId = site.CatalogId;
            ctx.LocaleCode = site.DefaultLocaleCode;
            ctx.CurrencyCode = site.DefaultCurrencyCode;

        }

        [HttpPostRoute(UriTemplate = "import")]
        public async Task<HttpResponseMessage> Import(int siteId)
        {

            await InitContextFromSite(siteId);
            MultipartFormDataStreamProvider streamProvider = new MultipartFormDataStreamProvider(System.IO.Path.GetTempPath());
            var bodyparts = await Request.Content.ReadAsMultipartAsync(streamProvider);
            var fileinfo = new FileInfo(streamProvider.FileData.SingleOrDefault().LocalFileName);

            var file = bodyparts.Contents.First();
            Dictionary<string, RedirectEntry> dic = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);

            using (var stream = fileinfo.OpenRead())
            {
                using (CsvReader rdr = new CsvReader(stream))
                {
                    bool first = true;
                    foreach (string[] row in rdr.RowEnumerator)
                    {
                        if (first)
                        {
                            first = false;
                            if (string.Equals(row[0], "source", StringComparison.OrdinalIgnoreCase))
                            {
                                continue;
                            }
                        }

                        var entry = new RedirectEntry()
                        {
                            Source = row[0],
                            Destination = row[1],
                            IsRewrite = row.Length > 2 && row[2] == "1",
                            IsTemporary = row.Length > 3 && row[3] == "1",
                            CopyQueryString = row.Length > 4 && row[4] == "1"
                        };
                        Validate(entry, dic.Count);
                        dic[entry.Source] = entry;


                    }
                }
            }

            dic = await _redirectRepository.UpdateRedirectEntries(dic, siteId);
            return Request.CreateResponse(HttpStatusCode.OK, EmptySingle2<bool>());
        }


        public sealed class CsvReader : System.IDisposable
        {
            public CsvReader(string fileName)
                : this(new FileStream(fileName, FileMode.Open, FileAccess.Read))
            {
            }

            public CsvReader(Stream stream)
            {
                __reader = new StreamReader(stream);
            }

            public System.Collections.IEnumerable RowEnumerator
            {
                get
                {
                    if (null == __reader)
                        throw new System.ApplicationException("I can't start reading without CSV input.");

                    __rowno = 0;
                    string sLine;
                    string sNextLine;

                    while (null != (sLine = __reader.ReadLine()))
                    {
                        while (rexRunOnLine.IsMatch(sLine) && null != (sNextLine = __reader.ReadLine()))
                            sLine += "\n" + sNextLine;

                        __rowno++;
                        string[] values = rexCsvSplitter.Split(sLine);

                        for (int i = 0; i < values.Length; i++)
                            values[i] = Csv.Unescape(values[i]);

                        yield return values;
                    }

                    __reader.Close();
                }
            }

            public long RowIndex { get { return __rowno; } }

            public void Dispose()
            {
                if (null != __reader) __reader.Dispose();
            }

            //============================================


            private long __rowno = 0;
            private TextReader __reader;
            private static Regex rexCsvSplitter = new Regex(@",(?=(?:[^""]*""[^""]*"")*(?![^""]*""))");
            private static Regex rexRunOnLine = new Regex(@"^[^""]*(?:""[^""]*""[^""]*)*""[^""]*$");
        }

        public static class Csv
        {
            public static string Escape(string s)
            {
                if (s.Contains(QUOTE))
                    s = s.Replace(QUOTE, ESCAPED_QUOTE);

                if (s.IndexOfAny(CHARACTERS_THAT_MUST_BE_QUOTED) > -1)
                    s = QUOTE + s + QUOTE;

                return s;
            }

            public static string Unescape(string s)
            {
                if (s.StartsWith(QUOTE) && s.EndsWith(QUOTE))
                {
                    s = s.Substring(1, s.Length - 2);

                    if (s.Contains(ESCAPED_QUOTE))
                        s = s.Replace(ESCAPED_QUOTE, QUOTE);
                }

                return s;
            }


            private const string QUOTE = "\"";
            private const string ESCAPED_QUOTE = "\"\"";
            private static char[] CHARACTERS_THAT_MUST_BE_QUOTED = { ',', '"', '\n' };
        }
    }
}
