using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
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

        private static MethodInfo _createGetterGeneric = typeof(CaseInsensitiveMemberResolver).GetMethod("CreateGetterGeneric", BindingFlags.NonPublic | BindingFlags.Static);
        private static MethodInfo _createFieldGetterGeneric = typeof(CaseInsensitiveMemberResolver).GetMethod("CreateFieldGetterGeneric", BindingFlags.NonPublic | BindingFlags.Static);
        private static MethodInfo _createContainsKeyDelegateGeneric = typeof(CaseInsensitiveMemberResolver).GetMethod("CreateContainsKeyDelegateGeneric", BindingFlags.NonPublic | BindingFlags.Static);
        private static MethodInfo _createIndexedGetterGeneric = typeof(CaseInsensitiveMemberResolver).GetMethod("CreateIndexedGetterGeneric", BindingFlags.NonPublic | BindingFlags.Static);

        
        static Func<object, object> CreateGetterGeneric<T, R>(MethodInfo getter) 
        {
            var getterTypedDelegate = (Func<T, R>)Delegate.CreateDelegate(typeof(Func<T, R>), getter);
            var getterDelegate = (Func<object, object>)((object instance) => getterTypedDelegate((T)instance));
            return getterDelegate;
        }


        static Func<object, object> CreateFieldGetterGeneric<S, T>(FieldInfo field)
        {
            var methodName = field.ReflectedType.FullName + ".get_" + field.Name;
            var getterMethod = new DynamicMethod(methodName, typeof(T), new Type[1] { typeof(S) }, true);
            var gen = getterMethod.GetILGenerator();
            if (field.IsStatic)
            {
                gen.Emit(OpCodes.Ldsfld, field);
            }
            else
            {
                gen.Emit(OpCodes.Ldarg_0);
                gen.Emit(OpCodes.Ldfld, field);
            }
            gen.Emit(OpCodes.Ret);


            var getterTypedDelegate = (Func<S, T>)getterMethod.CreateDelegate(typeof(Func<S, T>));
            var getterDelegate = (Func<object, object>)((object instance) => getterTypedDelegate((S)instance));
            return getterDelegate;
        }

        static Func<T, string, bool> CreateContainsKeyDelegateGeneric<T>(MethodInfo mi) where T : class
        {
            var typedDelegate = (Func<T, string, bool>)Delegate.CreateDelegate(typeof(Func<T, string, bool>), mi);
            var objectDelegate = (Func<object, string, bool>)((object instance, string key) => typedDelegate((T)instance, key));
            return objectDelegate;
        }

        static Func<object, string, bool> CreateContainsKeyDelegate(MethodInfo mi)
        {

            var genericHelper = _createContainsKeyDelegateGeneric.MakeGenericMethod(mi.DeclaringType);
            return (Func<object, string, bool>)genericHelper.Invoke(null, new object[] { mi });
        }


        static Func<object, object> CreateDelegate(PropertyInfo pi)
        {
            var genericHelper = _createGetterGeneric.MakeGenericMethod(pi.DeclaringType, pi.PropertyType);
            return (Func<object, object>)genericHelper.Invoke(null, new object[] { pi.GetGetMethod() });
        }

        static Func<object, object> CreateDelegate(FieldInfo fi)
        {
            var genericHelper = _createFieldGetterGeneric.MakeGenericMethod(fi.DeclaringType, fi.FieldType);
            return (Func<object, object>)genericHelper.Invoke(null, new object[] { fi });
        }

        static Func<object, string, object> CreateIndexedGetterGeneric<T, R>(MethodInfo getter) where T : class
        {
            var getterTypedDelegate = (Func<T, string, R>)Delegate.CreateDelegate(typeof(Func<T, string, R>), getter);
            var getterDelegate = (Func<object, string, object>)((object instance, string key) => getterTypedDelegate((T)instance, key));
            return getterDelegate;
        }



        static Func<object, string, object> CreateIndexedDelegate(PropertyInfo pi)
        {
            var genericHelper = _createIndexedGetterGeneric.MakeGenericMethod(pi.DeclaringType, pi.PropertyType);
            return (Func<object, string, object>)genericHelper.Invoke(null, new object[] { pi.GetGetMethod() });
        }


        private static MemberAccessors Doit(Type t)
        {
           

            var dic = new Dictionary<string, Func<object,object>[]>(StringComparer.OrdinalIgnoreCase);


            var props = t.GetProperties(BindingFlags.Public | BindingFlags.GetProperty | BindingFlags.Instance).Where(x => x.CanRead );
            
            foreach (var g in props.Where(x => x.GetIndexParameters().Length == 0).GroupBy(x=> x.Name ))
            {
                dic[g.Key] = g.Select(CreateDelegate).ToArray();

            }
            Dictionary<string, Func<object, object>> fields = null;
            if ( t.FullName.StartsWith( "NDjango"))
            {
                fields = t.GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance).ToDictionary(x => x.Name.Replace("@",""), y=> CreateDelegate(y), StringComparer.OrdinalIgnoreCase);
            }



            var containsKey = t.GetMethods(BindingFlags.Instance | BindingFlags.InvokeMethod | BindingFlags.Public).Where(x => x.Name == "ContainsKey" && x.GetParameters().Count() == 1 && x.GetParameters().First().ParameterType == typeof ( string )).Select(x => CreateContainsKeyDelegate(x)).FirstOrDefault();


            

            return new MemberAccessors()
                   {
                       Fields = fields,
                       PropertyDictionary = dic,
                       Indexers = props.Where(x => x.GetIndexParameters().Length ==1  && x.GetIndexParameters().First().ParameterType== typeof(string)).Select(CreateIndexedDelegate).ToArray(),
                       ContainsKey = containsKey
                   };

            
        }

        public class MemberAccessors
        {
            public Dictionary<string, Func<object, object>[]> PropertyDictionary { get; set; }

            public Func<object, string,object>[] Indexers { get; set; }

            public Dictionary<string, Func<object, object>> Fields { get; set; }


            public Func<object, string,bool > ContainsKey { get; set; }
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
            object ret;
            if (container is IDictionary<string, object> && ((IDictionary<string,Object>)container).TryGetValue(memberName, out ret))
            {
                return new FSharpOption<object>(CleanJson(ret));
            }
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
            
            Func<object,object >[] mis;
            if (lookup.PropertyDictionary.TryGetValue(memberName, out mis))
            {
                for (int i = 0; i < mis.Length; i++)
                {
                    try
                    {
                        object obj = mis[i](container);
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
                    

                   
                     //   bool contanisKey = true;
                        if (lookup.ContainsKey != null )
                        {
                            bool containsKey = (bool) lookup.ContainsKey(container, memberName);
                            if (!containsKey)
                            {
                                continue;
                            }
                        }


                        return new FSharpOption<object>(CleanJson(lookup.Indexers[i](container,  memberName )));    
                    
                    
                }
                catch 
                {
                    
                    
                }
            }
            Func<object,object> fi;
            if (lookup.Fields != null && lookup.Fields.TryGetValue(memberName, out fi))
            {
                try
                {
                    return new FSharpOption<object>(CleanJson(fi(container)));
                }
                catch
                {
                }
               
            }
          
            return null;
        }
    }
}
