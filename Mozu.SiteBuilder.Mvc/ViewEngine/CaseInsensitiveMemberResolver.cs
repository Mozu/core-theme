using System;
using System.Collections;
using System.Dynamic;
using Microsoft.FSharp.Core;
using NDjango.Interfaces;
using NDjango.FiltersCS;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class JsonCleaningCaseInsensitiveMemberResolver : IMemberResolver
    {
        private static IMemberResolver _actual;
        static JsonCleaningCaseInsensitiveMemberResolver()
        {
            _actual = new CaseInsensitiveMemberResolver();
        }

        public static object CleanJson(object val)
        {
            var jVal = val as Newtonsoft.Json.Linq.JValue;
            if (jVal != null)
            {
                return jVal.Value;
            }
            var jArray = val as Newtonsoft.Json.Linq.JArray;
            if (jArray != null)
            {
                return new JarrayWrapper(jArray);
            }
            return val;
        }
        class JarrayWrapper : IEnumerable, IList
        {
            public JarrayWrapper(Newtonsoft.Json.Linq.JArray innerArray)
            {
                InnerArray = innerArray;
            }
            Newtonsoft.Json.Linq.JArray InnerArray;
            public IEnumerator GetEnumerator()
            {
                for (int i = 0; i < InnerArray.Count; i++)
                {
                    yield return this[i];
                }
            }

            public int Add(object value)
            {
                throw new NotImplementedException();
            }

            public void Clear()
            {
                throw new NotImplementedException();
            }

            public bool Contains(object value)
            {
                throw new NotImplementedException();
            }

            public int IndexOf(object value)
            {
                throw new NotImplementedException();
            }

            public void Insert(int index, object value)
            {
                throw new NotImplementedException();
            }

            public bool IsFixedSize
            {
                get { throw new NotImplementedException(); }
            }

            public bool IsReadOnly
            {
                get { throw new NotImplementedException(); }
            }

            public void Remove(object value)
            {
                throw new NotImplementedException();
            }

            public void RemoveAt(int index)
            {
                throw new NotImplementedException();
            }

            public object this[int index]
            {
                get
                {
                    return CleanJson(InnerArray[index]);
                }
                set
                {
                    throw new NotImplementedException();
                }
            }

            public void CopyTo(Array array, int index)
            {
                throw new NotImplementedException();
            }

            public int Count
            {
                get { return InnerArray.Count; }
            }

            public bool IsSynchronized
            {
                get { throw new NotImplementedException(); }
            }

            public object SyncRoot
            {
                get { throw new NotImplementedException(); }
            }
        }


        public T ResolveMemberOrDefault<T>(object container, string memberName, T defaultValue = default(T))
        {
            var result = ResolveMember(container, memberName);
            if (OptionModule.IsNone(result) || result.Value.GetType() != typeof(T))
                return defaultValue;
            else
                return (T)result.Value;
        }

        static readonly FSharpFunc<object, object> cleanFunc = FuncConvert.ToFSharpFunc<object, object>(CleanJson);
        static System.Collections.Concurrent.ConcurrentDictionary<string, MemberResolverGetMemberBinder> _binders = new System.Collections.Concurrent.ConcurrentDictionary<string, MemberResolverGetMemberBinder>();

        public FSharpOption<object> ResolveMember(object container, string memberName)
        {
            if (string.IsNullOrEmpty(memberName)) return FSharpOption<object>.None;
            var result = ResolveProperty(container, memberName);
            return OptionModule.Map(cleanFunc, result);
        }

        static FSharpOption<object> ResolveProperty(object container, string memberName)
        {
            if (container is Microsoft.ClearScript.V8.IV8ScriptItem)
            {
                return ResolveFromClearScriptBinders(container, memberName);
            }
            else if (container is JObject)
            {
                return ResolveFromJObject(container, memberName);
            }
            else
            {
                return _actual.ResolveMember(container, memberName);
            }
        }

        static FSharpOption<object> ResolveFromJObject(object container, string memberName)
        {
            var jobj = container as JObject;
            if (jobj == null) return FSharpOption<object>.None;

            var dictLookup = jobj.Property(memberName);
            if (dictLookup != null) return FSharpOption<object>.Some(dictLookup.Value);

            // in worst case now we have to iterator over properties ordinally
            var propLookup = jobj.Properties().FirstOrDefault(prop => prop.Name.Equals(memberName, StringComparison.OrdinalIgnoreCase));
            if (propLookup == null) return FSharpOption<object>.None;
            else return FSharpOption<object>.Some(propLookup.Value);
        }

        static FSharpOption<object> ResolveFromClearScriptBinders(object container, string memberName)
        {
            var binder = _binders.GetOrAdd(memberName, s => new MemberResolverGetMemberBinder(memberName, false));
            object res;
            if (!((DynamicObject)container).TryGetMember(binder, out res))
            {
                res = null;
            }
            res = res is Microsoft.ClearScript.Undefined ? null : res;
            if (res == null) return FSharpOption<object>.None;
            else return FSharpOption<object>.Some(res);
        }


        class MemberResolverGetMemberBinder : GetMemberBinder
        {
            public MemberResolverGetMemberBinder(string name, bool ignoreCase)
                : base(name, ignoreCase)
            {
            }

            public override DynamicMetaObject FallbackGetMember(DynamicMetaObject target, DynamicMetaObject errorSuggestion)
            {
                return null;
            }
        }

    }
}
