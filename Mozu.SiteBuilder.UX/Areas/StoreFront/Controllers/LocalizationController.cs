using System;
using System.Collections.Generic;

using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Localization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class LocalizationController : BaseApiController
    {
        private ILocalizationRepository _localizationRepository;

        public LocalizationController(ILocalizationRepository localizationRepository)
        {
            _localizationRepository = localizationRepository ?? throw new ArgumentNullException(nameof(localizationRepository));
        }

        public JObject Index(string colKey, string key)
        {
            var res = _localizationRepository.Get(colKey, key);
            var o = new JObject {{"foo", res}};

            return o;
        }

        public JObject Collections(string keys)
        {
            var j = new JObject();

            if (string.IsNullOrEmpty(keys)) return j;

            var arrK = keys.Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries);
            var collections = _localizationRepository.GetCollections(arrK);

            if (collections == null || collections.Count <= 0) return j;

            foreach (var key in collections.Keys)
            {
                var c = new JObject();

                if(collections.TryGetValue(key, out var dic))
                {
                    foreach (var k in dic.Keys)
                    {
                        c.Add(k, dic[k]);
                    }
                }

                j.Add(key, c);
            }

            // TODO: STUFF GOES HERE
            return j;
        }
    }
}
