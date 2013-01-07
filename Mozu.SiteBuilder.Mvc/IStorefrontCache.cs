using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Text;
using System.Web;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc
{
    public interface  IStorefrontCache
    {
        object this[string key] { get; set; }
        void ClearAll();
        IEnumerable<string> Keys { get; }
        void Clear(string key);
    }
    public class StorefrontCache : IStorefrontCache
    {

        public object this[string key]
        {
            get { return null; }
            set {  }
        }







        public void ClearAll()
        {
          
        }

        public IEnumerable<string> Keys
        {
            get { return System.Linq.Enumerable.Empty<string>(); }
        }

        public void Clear(string key)
        {
           
        }
    }

    public class DefaultStorefrontCache : IStorefrontCache
    {
        private readonly IApiContext _context;
        private readonly HttpContextBase _httpContext;

        private System.Collections.Hashtable _inner;
        public DefaultStorefrontCache( Mozu.Core.IApiContext context, System.Web.HttpContextBase httpContext  )
        {
            _context = context;
            _httpContext = httpContext;
            var cache = System.Runtime.Caching.MemoryCache.Default;
            var key = typeof (DefaultStorefrontCache).FullName  + context.SiteId;
            _inner = (System.Collections.Hashtable )cache[key];
            

            if ( _inner == null )
            {
                _inner = new Hashtable();
                cache.Add(new CacheItem(key, _inner), new CacheItemPolicy()
                                                          {
                                                              AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(10)
                                                          });
            }

            if ( httpContext.Request["iseditmode"] == "true")
            {
              //  this.ClearAll();

            }
        }

        public object this[string key]
        {
            get
            {
                 return _inner[key];
               
            }
            set
            {
                lock (_inner)
                {
                    _inner[key] = value;
                }
            }

        }


        public void ClearAll()
        {
            lock (_inner)
            {
                _inner.Clear();
            }
        }





        public IEnumerable<string> Keys
        {
            get
            {
                List<string> list = null;
                lock (this)
                {
                    list = new List<string>(_inner.Keys.OfType<string>());
                }
                return list; 
                
            }
        }

        public void Clear(string key)
        {
            lock (_inner)
            {
                _inner.Remove(key);
            }
        }
    }
}
