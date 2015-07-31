using System;
using System.Collections.Generic;
using System.IO;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/localization", SuppressDescriptorGeneration = true)]
    public class LocalizationController : BaseController
    {
        private readonly HttpContextBase _httpContext;

        public LocalizationController(HttpContextBase httpContext)
        {
            _httpContext = httpContext;
        }
      
        [ApiAuthorize]
        [HttpGetRoute(UriTemplate = "read")]
        public Response<List<KeyValuePair<string, string>>> GetStringsService()
        {
            
            var list = GetStrings();

            return List2(list);
        }

        public List<KeyValuePair<string, string>> GetStrings()
        {
            var lang = Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName;
            var list = new List<KeyValuePair<string, string>>();

            var path = _httpContext.Server.MapPath(@"/admin/scripts/app/locale/lang-" + lang + ".csv");

            if (!File.Exists(path)) return Enumerable.Empty<KeyValuePair<string, string>>().ToList();

            // TODO: async-y reading magic
            using (var reader = new StreamReader(System.IO.File.OpenRead(path)))
            {
                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();

                    if (line != null)
                    {
                        var parts = line.Split('|');

                        if (parts.Length != 2)
                        {
                            throw new Exception("Localization file format is corrupt.");
                        }

                        list.Add(new KeyValuePair<string, string>(parts[0], parts[1]));
                    }
                }
            }

            return list;
        }
    }
}