using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.FSharp.Core;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class CaseInsensitiveMemberResolver : IMemberResolver
    {
        private static ConcurrentDictionary<Type, Tuple<PropertyInfo[], Dictionary<string, MethodInfo>>> _lookupDic = new ConcurrentDictionary<Type, Tuple<PropertyInfo[], Dictionary<string, MethodInfo>>>();


        private static Tuple<PropertyInfo[], Dictionary<string, MethodInfo >> Doit(Type t)
        {
            var dic = new Dictionary<string, MethodInfo>(StringComparer.OrdinalIgnoreCase);
            var props = t.GetProperties(BindingFlags.Public | BindingFlags.GetProperty | BindingFlags.Instance).Where(x => x.CanRead );
            
            foreach (var p in props.Where(x => x.GetIndexParameters().Length == 0))
            {
                if (p.GetIndexParameters().Length == 0)
                {
                    dic[p.Name] = p.GetMethod ;
                }
            }

            return new Tuple<PropertyInfo[], Dictionary<string, MethodInfo>>(props.Where(x => x.GetIndexParameters().Length > 0).ToArray(), dic);
            
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
                    return CaseInsensitiveMemberResolver.CleanJson(InnerArray[index]);
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
        public FSharpOption<object> ResolveMember(object container, string memberName)
        {
            var jobject = container as Newtonsoft.Json.Linq.JObject;
            if (jobject != null)
            {
                return new FSharpOption<object>(CleanJson(jobject.GetValue(memberName, StringComparison.OrdinalIgnoreCase)));


            }
            var jArray = container as Newtonsoft.Json.Linq.JArray;
            if (jArray != null)
            {
                int f = 0;
            }


            var lookup = _lookupDic.GetOrAdd(container.GetType(), Doit);
            MethodInfo mi;
            if (lookup.Item2.TryGetValue(memberName, out mi))
            {
                try
                {
                    return new FSharpOption<object>(CleanJson(mi.Invoke(container, null)));
                }
                catch 
                {
                   
                }
                
            }
            for (int i = 0; i < lookup.Item1.Length ; i++)
            {
                try
                {
                    var param = System.Convert.ChangeType(memberName , lookup.Item1[i].GetIndexParameters()[0].ParameterType);
                    return new FSharpOption<object>(CleanJson(lookup.Item1[i].GetMethod.Invoke(container,new object[]{param })));
                }
                catch 
                {
                    
                    
                }
            }



            return null;
        }
    }
}
