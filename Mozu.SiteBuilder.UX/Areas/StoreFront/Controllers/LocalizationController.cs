using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Localization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class LocalizationController : BaseController
    {
        private ILocalizationRepository _localizationRepository;

        public LocalizationController(ILocalizationRepository localizationRepository)
        {
            if(localizationRepository == null)
            {
                throw new ArgumentNullException("localizationRepository");
            }

            _localizationRepository = localizationRepository;
        }

        public JsonDCResult Index(string colKey, string key)
        {
            var res = _localizationRepository.Get(colKey, key);
            var o = new JObject();
            
            o.Add("foo", res);
            
            return new JsonDCResult
            {
                Data = o,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public JsonDCResult Collections(string keys)
        {
            var j = new JObject();

            if (!string.IsNullOrEmpty(keys))
            {
                var arrK = keys.Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries);
                var collections = _localizationRepository.GetCollections(arrK);

                if(collections != null && collections.Count > 0)
                {
                    foreach (var key in collections.Keys)
                    {
                        Dictionary<string, string> dic;
                        var c = new JObject();

                        if(collections.TryGetValue(key, out dic))
                        {
                            foreach (var k in dic.Keys)
                            {
                                c.Add(k, dic[k]);
                            }
                        }

                        j.Add(key, c);
                    }
                }
            }

            // TODO: STUFF GOES HERE

            return new JsonDCResult
            {
                Data = j,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public JsonDCResult Flush()
        {
            _localizationRepository.ClearCache();

            return new JsonDCResult
            {
                Data = "Cache flushed",
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}
