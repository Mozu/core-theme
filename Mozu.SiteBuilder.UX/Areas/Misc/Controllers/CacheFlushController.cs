//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Web;
//
//using Newtonsoft.Json;
//using Newtonsoft.Json.Linq;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.UX.Models;

//namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
//{
//    public class CacheFlushController : Controller
//    {
//        private readonly IStorefrontCache _cache;

//        public CacheFlushController(IStorefrontCache cache)
//        {
//            _cache = cache;
//        }
//        //
//        // GET: /Misc/CacheFlush/

//        public JsonDCResult Index()
//        {
//            //todo make testable with model binder maybe?
//            var jObject = Newtonsoft.Json.Linq.JObject.Load(new JsonTextReader(new StreamReader(this.HttpContext.Request.InputStream)));
//            JToken  modelTkn;
//            if (jObject.TryGetValue("model", out modelTkn))
//            {
//                FulshModel((string) modelTkn);
//            }
//            var message = jObject as dynamic;
//            return new JsonDCResult()
//            {
//                Data = new Response<bool>()
//                {
//                    Data = true,
//                    Success = true
//                }


//            };
//        }
//        void FulshModel(string model)
//        {
//            _cache.ClearAll();
//        }

//    }
//}
