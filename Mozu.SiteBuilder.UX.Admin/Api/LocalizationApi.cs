using System;
using System.Collections.Generic;
using System.IO;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class LocalizationController : BaseController
    {
        [ApiAuthorize]
        [WebGet(UriTemplate = "read")]
        public Response<List<KeyValuePair<string, string>>> GetStrings()
        {
            var lang = Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName;
            var list = new List<KeyValuePair<string, string>>();
            var path = HttpContext.Current.Server.MapPath(@"/admin/scripts/app/locale/lang-" + lang + ".csv");

            // TODO: async-y reading magic
            using (var reader = new StreamReader(File.OpenRead(path)))
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

            return List2(list);
        } 
    }
}