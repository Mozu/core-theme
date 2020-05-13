using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using Microsoft.Extensions.DependencyInjection;
using System.IO;
using Mozu.Core.Actions.Contracts;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Collections;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : ObjectResult, IViewResult
    {
        ArcJsDictionary _arcJsDic;
        public ViewResultBase() : base(null)
        {
            this.Value = this;
        }
        private ViewDataDictionary _viewDataDictionary;
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public ViewDataDictionary ViewData
        {
            get => _viewDataDictionary ??= new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary());
            set => _viewDataDictionary = value;
        }
        public string ViewName { get; set; }
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public HyprView View { get; set; }

        IDictionary<string, object> IViewResult.ViewData
        {
            get
            {
                _arcJsDic = _arcJsDic ?? new ArcJsDictionary(this.ViewData);
                return _arcJsDic;
            }
        }
        // Server-side JS
        //[JsonIgnore]
        //System.Collections.Generic.IDictionary<string, object> Core.Actions.Contracts.Http.IViewResult.ViewData
        //{
        //    get { return this.ViewData; }
        //}

        class ArcJsDictionary : IDictionary<string, object>
        {
            public ArcJsDictionary(ViewDataDictionary viewDataDic)
            {
                _viewDataDic = viewDataDic;
                _inner = new Dictionary<string, object>()
                {
                    {"model", _viewDataDic.Model }

                };
            }
            IDictionary<string, object> _inner;
            private readonly ViewDataDictionary _viewDataDic;

            public object this[string key]
            {
                get
                {
                    return _inner[key];
                }
                set
                {
                    if (key == "model")
                    {
                        _viewDataDic.Model = value;
                    }
                    else
                    {
                        _viewDataDic[key] = value;
                    }
                    _inner[key] = value;
                }
            }
            public ICollection<string> Keys => _inner.Keys;

            public ICollection<object> Values => _inner.Values;

            public int Count => _inner.Count;

            public bool IsReadOnly => _inner.IsReadOnly;

            public void Add(string key, object value)
            {
                _inner.Add(key, value);
            }

            public void Add(KeyValuePair<string, object> item)
            {
                _inner.Add(item);
            }

            public void Clear()
            {
                _inner.Clear();
            }

            public bool Contains(KeyValuePair<string, object> item)
            {
                return _inner.Contains(item);
            }

            public bool ContainsKey(string key)
            {
                return _inner.ContainsKey(key);
            }

            public void CopyTo(KeyValuePair<string, object>[] array, int arrayIndex)
            {
                _inner.CopyTo(array, arrayIndex);
            }

            public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
            {
                return _inner.GetEnumerator();
            }

            public bool Remove(string key)
            {
                return _inner.Remove(key);
            }

            public bool Remove(KeyValuePair<string, object> item)
            {
                return _inner.Remove(item);
            }

            public bool TryGetValue(string key, [MaybeNullWhen(false)] out object value)
            {
                return _inner.TryGetValue(key, out value);
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return _inner.GetEnumerator();
            }
        }

    }
    
}