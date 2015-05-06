using System;
using System.Collections;
using Microsoft.FSharp.Core;
using NDjango.Interfaces;
using NDjango.FiltersCS;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class JsonCleaningCaseInsensitiveMemberResolver : IMemberResolver
    {
        private static IMemberResolver _actual;
        static JsonCleaningCaseInsensitiveMemberResolver()
        {
            _actual = new CaseInsensitiveMemberResolver();
        }

        public static  object CleanJson(object val)
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
        class  JarrayWrapper :IEnumerable, IList
        {
            public JarrayWrapper(Newtonsoft.Json.Linq.JArray innerArray)
            {
                InnerArray = innerArray;
            }
            Newtonsoft.Json.Linq.JArray InnerArray;
            public IEnumerator GetEnumerator()
            {
                for ( int i = 0; i < InnerArray.Count;i++)
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
                get { return InnerArray.Count ; }
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


        static readonly FSharpFunc<object, object> cleanFunc = FuncConvert.ToFSharpFunc<object, object>(CleanJson);

        public FSharpOption<object> ResolveMember(object container, string memberName)
        {
            var result = _actual.ResolveMember(container, memberName);
            return OptionModule.Map(cleanFunc, result);
        }
    }
}
