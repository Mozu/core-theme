//using System;
//using System.Collections;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using System.Runtime.Caching;
//using System.Text;
//using System.Web;
//using Magnum.Linq;
//using Mozu.Core;

//namespace Mozu.SiteBuilder.Mvc
//{
//    [Obsolete]
//    public interface  IStorefrontCache
//    {
//        object this[string key] { get; set; }
//        void ClearAll();
//        IEnumerable<string> Keys { get; }
//        void Clear(string key);
//    }

//    [Obsolete]
//    public class StorefrontCache : IStorefrontCache
//    {
//        private readonly HttpRequestMessage _httpRequestMessage;

//        public StorefrontCache(HttpRequestMessage httpRequestMessage)
//        {
//            _httpRequestMessage = httpRequestMessage;
//        }

//        public object this[string key]
//        {
//            get { return null; }
//            set {  }
//        }







//        public void ClearAll()
//        {
          
//        }

//        public IEnumerable<string> Keys
//        {
//            get { return System.Linq.Enumerable.Empty<string>(); }
//        }

//        public void Clear(string key)
//        {
           
//        }
//    }

//    public class DefaultStorefrontCache : IStorefrontCache
//    {
//        private readonly HttpRequestMessage _httpRequestMessage;
//        private readonly IApiContext _context;

       
//        public bool Readable { get; set; }
//        private System.Collections.Hashtable _inner;
//        public DefaultStorefrontCache(Mozu.Core.IApiContext context, HttpRequestMessage httpRequestMessage)
//        {
//            _context = context;
//            _httpRequestMessage = httpRequestMessage;
            
//            var cache = System.Runtime.Caching.MemoryCache.Default;
//            var key = typeof (DefaultStorefrontCache).FullName  + context.SiteId;
//            _inner = (System.Collections.Hashtable )cache[key];
            

//            if ( _inner == null )
//            {
//                _inner = new Hashtable();
//                cache.Add(new CacheItem(key, _inner), new CacheItemPolicy()
//                                                          {
//                                                              AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(5)
//                                                          });
//            }
//            this.Readable = context.DataViewMode != DataViewModeType.Pending;
//            object tmp;
//            if (_httpRequestMessage.GetRouteData().Values.TryGetValue("controller", out tmp))
//            {
//                var controller = tmp.ToString();
//                this.Readable = DependantResouceControllers.Contains((string) tmp, StringComparer.OrdinalIgnoreCase);
//            }
           
//        }
//        static List<string> DependantResouceControllers = new List<string>() { "content", "resource" , "script" };

//        public object this[string key]
//        {
//            get
//            {
//                if (Readable)
//                {
//                    return _inner[key];
//                }
//                return null;

//            }
//            set
//            {
//                lock (_inner)
//                {
//                    _inner[key] = value;
//                }
//            }

//        }


//        public void ClearAll()
//        {
//            lock (_inner)
//            {
//                _inner.Clear();
//            }
//        }





//        public IEnumerable<string> Keys
//        {
//            get
//            {
//                List<string> list = null;
//                lock (this)
//                {
//                    list = new List<string>(_inner.Keys.OfType<string>());
//                }
//                return list; 
                
//            }
//        }

//        public void Clear(string key)
//        {
//            lock (_inner)
//            {
//                _inner.Remove(key);
//            }
//        }
//    }
//}
