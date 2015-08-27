using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using Autofac;


namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class ViewDataDictionary : IDictionary<string, object> , Microsoft.ClearScript.IPropertyBag
    {
        IDictionary<string, object> _inner = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
        public ViewDataDictionary() 
        {
            
        }
        public object Model
        {
            get
            {
                object model;
                TryGetValue("Model", out model);
                return model;
            }
            set { this["Model"] = value; }
        }

        public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
        {
            return _inner.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return ((IEnumerable) _inner).GetEnumerator();
        }

        public void Add(KeyValuePair<string, object> item)
        {
            _inner[item.Key] = item.Value;
        }

        public void Clear()
        {
            _inner.Clear();
        }

        public bool Contains(KeyValuePair<string, object> item)
        {
            return _inner.Contains(item);
        }

        public void CopyTo(KeyValuePair<string, object>[] array, int arrayIndex)
        {
            _inner.CopyTo(array, arrayIndex);
        }

        public bool Remove(KeyValuePair<string, object> item)
        {
            return _inner.Remove(item);
        }

        public int Count
        {
            get { return _inner.Count; }
        }

        public bool IsReadOnly
        {
            get { return _inner.IsReadOnly; }
        }

        public bool ContainsKey(string key)
        {
            return _inner.ContainsKey(key);
        }

        public void Add(string key, object value)
        {
            _inner[key] = value;
        }

        public bool Remove(string key)
        {
            return _inner.Remove(key);
        }

        public bool TryGetValue(string key, out object value)
        {
            return _inner.TryGetValue(key, out value);
        }

        public object this[string key]
        {
            get {
                object obj;
                if (_inner.TryGetValue(key, out obj))
                {
                    return obj;
                }
                return null;
            }
            set 
            {
                if (value is Microsoft.ClearScript.V8.IV8ScriptItem)
                {
                    value = Newtonsoft.Json.Linq.JToken.FromObject(value);
                }
                _inner[key] = value;
            
            }
        }

        public ICollection<string> Keys
        {
            get { return _inner.Keys; }
        }

        public ICollection<object> Values
        {
            get { return _inner.Values; }
        }
    }

    public static class HttpControllerContextExtensions
    {
        public static HttpContextBase HttpContext(this HttpControllerContext context)
        {
            return context.Resolve<HttpContextBase>();
        }

        public static T Resolve<T>(this HttpControllerContext context)
        {
            return context.Request.LifetimeScope().Resolve<T>();
        }

        public static ILifetimeScope LifetimeScope(this HttpRequestMessage request)
        {
            return ((ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope)));
        }

        public static T Resolve<T>(this HttpRequestMessage request)
        {
            return request.LifetimeScope().Resolve<T>();
        }

        public static HttpContextBase HttpContext(this HttpRequestMessage request)
        {
            return request.Resolve<HttpContextBase>();
        }
    }

    public class HyprViewContext
    {
        private HttpContextBase _httpContext;
        private ILifetimeScope _lifetimeScope;

        public HyprViewContext(HttpRequestMessage requestMessage, ViewDataDictionary viewData, HyprViewContext parentActionViewContext = null)
        {
            RequestMessage = requestMessage;
            ViewData = viewData;
            ParentActionViewContext = parentActionViewContext;
        }

        public HttpRequestMessage RequestMessage  { get; set; }
        public ViewDataDictionary ViewData { get; set; }
        public HyprViewContext ParentActionViewContext { get; set; }


        public ILifetimeScope LifetimeScope
        {
            get
            {
                if (_lifetimeScope != null) return _lifetimeScope;
                _lifetimeScope = GetRootLifeTimeScope(this);
                return _lifetimeScope;
            }
            set { _lifetimeScope = value; }
        }

        private static ILifetimeScope GetRootLifeTimeScope(HyprViewContext ctx)
        {
            ILifetimeScope scope = null;
            if (ctx.ParentActionViewContext != null && ctx.ParentActionViewContext.LifetimeScope != null)
            {
                scope = GetRootLifeTimeScope(ctx.ParentActionViewContext);
            }
            else if (ctx.RequestMessage != null)
            {
                scope = ctx.RequestMessage.LifetimeScope();
            }
            return scope;
        }

        public virtual HttpContextBase HttpContext
        {
            get { return _httpContext ?? (_httpContext = LifetimeScope.Resolve<HttpContextBase>()); }
            set { _httpContext = value; }
        }
    }
}