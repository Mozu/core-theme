using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Magnum.Extensions;
using Microsoft.FSharp.Core;
using Mozu.Reference.Contracts;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class CaseInsensitiveMemberResolver : IMemberResolver
    {
        private static ConcurrentDictionary<Type, MemberAccessors> _lookupDic = new ConcurrentDictionary<Type, MemberAccessors>();


        private static MemberAccessors Doit(Type t)
        {
           

            var dic = new Dictionary<string, MethodInfo[]>(StringComparer.OrdinalIgnoreCase);


            var props = t.GetProperties(BindingFlags.Public | BindingFlags.GetProperty | BindingFlags.Instance).Where(x => x.CanRead );
            
            foreach (var g in props.Where(x => x.GetIndexParameters().Length == 0).GroupBy(x=> x.Name ))
            {
                dic[g.Key] = g.Select(x=> x.GetMethod ).ToArray();

            }
            Dictionary<string, FieldInfo> fields = null;
            if ( t.FullName.StartsWith( "NDjango"))
            {
                fields = t.GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance).ToDictionary(x => x.Name.Replace("@",""), StringComparer.OrdinalIgnoreCase);



            }



            var containsKey = t.GetMethods(BindingFlags.Instance | BindingFlags.InvokeMethod | BindingFlags.Public).FirstOrDefault(x => x.Name == "ContainsKey" && x.GetParameters().Count() == 1);


            

            return new MemberAccessors()
                   {
                       Fields = fields,
                       PropertyDictionary = dic,
                       Indexers = props.Where(x => x.GetIndexParameters().Length > 0).ToArray(),
                       ContainsKey = containsKey
                   };

            
        }

        public class MemberAccessors
        {
            public Dictionary<string, MethodInfo[]> PropertyDictionary { get; set; }

            public PropertyInfo[] Indexers { get; set; }

            public Dictionary<string, FieldInfo > Fields { get; set; }


            public MethodInfo  ContainsKey  { get; set; }
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

        private const string Length = "length";
        public FSharpOption<object> ResolveMember(object container, string memberName)
        {
            var lookup = _lookupDic.GetOrAdd(container.GetType(), Doit);

            //add support for looking up stuff by Length enven if only count is available
            if (string.Equals(memberName, Length, StringComparison.OrdinalIgnoreCase))
            {
                var list = container as IList;
                if (list != null)
                {
                    return new FSharpOption<object>(list.Count); ;
                }

                if (!lookup.PropertyDictionary.ContainsKey(Length))
                {
                    memberName = "Count";
                }

            }
            
            MethodInfo[] mis;
            if (lookup.PropertyDictionary.TryGetValue(memberName, out mis))
            {
                for (int i = 0; i < mis.Length; i++)
                {
                    try
                    {
                        object obj = mis[i].Invoke(container, null);
                        if (obj != null)
                        {
                            return new FSharpOption<object>(CleanJson(obj));
                        }


                    }
                    catch
                    {

                    }
                }
                
            }
           
            for (int i = 0; i < lookup.Indexers.Length ; i++)
            {
                try
                {
                    Type paramType = lookup.Indexers[i].GetIndexParameters()[0].ParameterType;
                    object param = null;
                    if (paramType == typeof (string))
                    {
                        param = memberName;
                    }else if ( paramType == typeof (int))
                    {
                        int tmpInt;
                        if (int.TryParse(memberName, out tmpInt))
                        {
                            param = tmpInt;
                        }
                        
                    }else if (paramType == typeof ( object ))
                    {
                        param = memberName;
                    }
                    else
                    {
                        throw new Exception("tell phipps 1 " + paramType);
                    }


                    if (param != null)
                    {
                     //   bool contanisKey = true;
                        if (lookup.ContainsKey != null && lookup.ContainsKey.GetParameters()[0].ParameterType == paramType)
                        {
                            bool containsKey = (bool) lookup.ContainsKey.Invoke(container, new object[] {param});
                            if (!containsKey)
                            {
                                continue;
                            }
                        }


                        return new FSharpOption<object>(CleanJson(lookup.Indexers[i].GetMethod.Invoke(container, new object[] { param })));    
                    }
                    
                }
                catch 
                {
                    
                    
                }
            }
            FieldInfo fi;
            if (lookup.Fields != null && lookup.Fields.TryGetValue(memberName, out fi))
            {
                try
                {
                    return new FSharpOption<object>(CleanJson(fi.GetValue(container)));
                }
                catch
                {
                }
               
            }
          
            return null;
        }
    }
}
