using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Models;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class CacheFlushController : Controller
    {
        private readonly IStorefrontCache _cache;

        public CacheFlushController(IStorefrontCache cache)
        {
            _cache = cache;
        }
        //
        // GET: /Misc/CacheFlush/

        public JsonDCResult Index(Newtonsoft.Json.Linq.JObject jObject)
        {
            JToken  modelTkn;
            if (jObject.TryGetValue("model", out modelTkn))
            {
                FulshModel((string) modelTkn);
            }
            var message = jObject as dynamic;
            return new JsonDCResult()
            {
                Data = new Response<bool>()
                {
                    Data = true,
                    Success = true
                }


            };
        }
        void FulshModel(string model)
        {
            _cache.ClearAll();
        }

    }
}
