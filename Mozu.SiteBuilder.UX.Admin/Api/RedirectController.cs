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
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
     [WebApi("app/redirects", SuppressDescriptorGeneration = true)]
    public  class RedirectController : BaseController
  
    {
         private readonly IRedirectRepository _redirectRepository;

         public RedirectController(IRedirectRepository redirectRepository)
         {
             _redirectRepository = redirectRepository;
         }
        //
        // GET: /Redirect/

         [HttpGetRoute(UriTemplate = "list")]
         public async Task<Response<List<RedirectEntry>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] bool draft = false)
         {
             var list = await _redirectRepository.FetchRedirectEntries();
             var tot = list.Count;
             list = list.Skip((pagingParams.pageIndex.Value - 1)*pagingParams.pageSize.Value).Take(pagingParams.pageSize.Value).ToList();
             return List2(list, tot);
         }

         [HttpPostRoute(UriTemplate = "create")]
         public  Task<Response<List<RedirectEntry>>> Create(List<RedirectEntry> redirects )
         {
             return  Edit(redirects);
         }

         [HttpPostRoute(UriTemplate = "edit")]
         public async Task<Response<List<RedirectEntry>>> Edit(List<RedirectEntry> redirects)
         {
             var list = await _redirectRepository.FetchRedirectEntries();
             foreach (var redirectEntry in redirects)
             {
                 var idx = list.FindIndex(x => x.Source == redirectEntry.Source);
                 if (idx > -1)
                 {
                     list[idx] = redirectEntry;
                 }
                 else
                 {
                     list.Add(redirectEntry);
                 }
             }
             list = list.OrderBy(x => x.Source).ToList();
             list = await _redirectRepository.UpdateRedirectEntries(list);

             return List2(redirects);
         }

         [HttpPostRoute(UriTemplate = "delete")]
         public async Task<Response<List<RedirectEntry>>> Delete(List<RedirectEntry> redirects)
         {
             var list = await _redirectRepository.FetchRedirectEntries();
             foreach (var redirectEntry in redirects)
             {
                 var idx = list.FindIndex(x => x.Source == redirectEntry.Source);
                 if (idx > -1)
                 {
                    list.RemoveAt(idx);
                 }
                 
             }
          //   list = list.OrderBy(x => x.Source).ToList();
             list = await _redirectRepository.UpdateRedirectEntries(list);

             return List2(redirects);
         }


         [HttpGetRoute(UriTemplate = "export")]
         public async Task<HttpResponseMessage> Export()
         {

             var ms = new MemoryStream();
             var sw = new StreamWriter(ms);
             var list = await _redirectRepository.FetchRedirectEntries();
        
             sw.WriteLine("source,destination,rewrite");
             list.ForEach(x => sw.WriteLine("\"{0}\",\"{1}\",{2}", x.Source.Replace("\"", "\"\""), x.Destination.Replace("\"", "\"\""), x.IsRewrite.GetValueOrDefault(false) ? 1 : 0));
             sw.Flush();
             ms.Position = 0;
             var content = new StreamContent(ms);
             var resp = Request.CreateResponse(HttpStatusCode.OK, content);
             resp.Content.Headers.ContentType= new MediaTypeHeaderValue("text/csv");
             resp.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
             resp.Content.Headers.ContentDisposition.Name = "export";
             resp.Content.Headers.ContentDisposition.FileName = "export.csv";
             
             return resp;
         }


         [HttpPostRoute(UriTemplate = "import")]
         public async Task<HttpResponseMessage> Import()
         {
             throw new NotImplementedException();
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
