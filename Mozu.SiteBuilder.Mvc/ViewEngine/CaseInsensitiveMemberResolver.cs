using System;
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
        private static System.Collections.Concurrent.ConcurrentDictionary<Type, Dictionary<string, MemberInfo[]>> _lookupDic = new ConcurrentDictionary<Type, Dictionary<string, MemberInfo[]>>();


        private static Dictionary<string, MemberInfo[]> Doit(Type t)
        {
            var dic = new Dictionary<string, MemberInfo[]>(StringComparer.OrdinalIgnoreCase);
            foreach (var g in t.GetMembers(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance).GroupBy(x => x.Name.ToLowerInvariant()))
            {
                dic[g.Key] = g.Where(x => x.MemberType == MemberTypes.Field || x.MemberType == MemberTypes.Method || x.MemberType == MemberTypes.Property).ToArray();
            }
            return dic;
        }

        public FSharpOption<object> ResolveMember(object container, string memberName)
        {

            var dic = _lookupDic.GetOrAdd(container.GetType(), Doit);

            MemberInfo[] infos;
            if (dic.TryGetValue(memberName, out infos))
            {
                for (int i = 0; i < infos.Length; i++)
                {
                    var pi = infos[i] as PropertyInfo;
                    if (pi != null)
                    {
                        return new FSharpOption<object>(pi.GetValue(container, null));
                    }
                    //todo: review if method calls  are needed
                    //todo: review if field calls are needed
                    var mi = infos[i] as MethodInfo;
                    if (mi != null)
                    {
                        return new FSharpOption<object>(mi.Invoke(container, null));
                    }

                    //if (infos[i] is PropertyInfo)
                    //    {
                    //        return new FSharpOption<object>(((PropertyInfo)info).GetValue(container, null));
                    //    }
                    //    if (info is MethodInfo)
                    //    {
                    //        return new FSharpOption<object>(((MethodInfo)info).Invoke(container, null));
                    //    }
                    //    else if (info is FieldInfo)
                    //    {
                    //        return new FSharpOption<object>(((FieldInfo)info).GetValue(container));
                    //    }
                    //    else 
                    //}
                }
            }



            return null;
        }
    }
}
