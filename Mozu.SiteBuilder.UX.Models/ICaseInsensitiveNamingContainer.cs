using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Mvc;
using System.Reflection;
namespace Mozu.SiteBuilder.UX.Models
{
    public interface IAlternateNamingValueContainer
    {
        object this[string key] { get; }
    }


    public interface ICmsMetaDataExtrator
    {
        System.Web.Mvc.ModelMetadata GetCmsModelMetadata(string expression );

    }
    public static class CaseInsensitiveNamingContainerExtension
    {
        static System.Collections.Concurrent.ConcurrentDictionary<Type, Dictionary<string, Func<object, object>>> g_funckyDics = new System.Collections.Concurrent.ConcurrentDictionary<Type, Dictionary<string, Func<object, object>>>();
        static Dictionary<string, Func<object, object>> CreateFunkyDic(Type t)
        {
            Dictionary<string, Func<object, object>> dic = new Dictionary<string, Func<object, object>>(StringComparer.OrdinalIgnoreCase);
            foreach (var prop in t.GetProperties( BindingFlags.Public | BindingFlags.Instance ).Where(x => x.CanRead ))
            {

                var objectExp = Expression.Parameter(typeof(object));
                var conv = Expression.Convert(objectExp, t);
                var memberAccess = Expression.MakeMemberAccess(conv, prop);
                var body = Expression.Convert(memberAccess, typeof(object));
                var fn2 = Expression.Lambda<Func<object, object>>(body, objectExp).Compile();

                dic[prop.Name] = fn2;
                foreach (var att in prop.GetCustomAttributes(false).OfType<AlternateNameAttribute>())
                //foreach (var att in prop.GetCustomAttributes(false).Where(x => x.GetType() == typeof(AlternateNameAttribute)).Cast<AlternateNameAttribute>())
                {
                    dic[att.Name] = fn2;
                }
                foreach (var att in prop.GetCustomAttributes(false).OfType<AdditionalMetadataAttribute>().Where(x => x.Name == "fieldName"))
                //foreach (var att in prop.GetCustomAttributes(false).Where(x => x is AdditionalMetadataAttribute).Cast<AdditionalMetadataAttribute>().Where(x => x.Name == "fieldName"))
                {
                    dic[(string)att.Value] = fn2;
                }
            }
            return dic;
        }
        static System.Collections.Concurrent.ConcurrentDictionary<Type, Dictionary<string, System.Reflection.PropertyInfo >> g_propDics = new System.Collections.Concurrent.ConcurrentDictionary<Type,Dictionary<string,System.Reflection.PropertyInfo>>();

        static Dictionary<string, System.Reflection.PropertyInfo> CreatePropDic(Type t)
        {
            var dic = new Dictionary<string, System.Reflection.PropertyInfo>(StringComparer.OrdinalIgnoreCase);
            foreach (var prop in t.GetProperties().Where(x => x.CanRead))
            {

                dic[prop.Name] = prop;
                foreach (var att in prop.GetCustomAttributes(false).OfType<AlternateNameAttribute>())
                {
                    dic[att.Name] = prop;
                }
                foreach (var att in prop.GetCustomAttributes(false).OfType<AdditionalMetadataAttribute>().Where(x => x.Name == "fieldName"))
                {
                    dic[(string)att.Value] = prop;
                }
            }
            return dic;
        }
        public static Dictionary<string, Func<object, object>> GetOrCreateFunkyDic(this IAlternateNamingValueContainer container)
        {
            return g_funckyDics.GetOrAdd(container.GetType(), CreateFunkyDic);
        }
        public static object  GetAlternateNamedValue ( this IAlternateNamingValueContainer container,  string name )
        {
            Func<object, object> fn;
            if (container.GetOrCreateFunkyDic().TryGetValue(name, out fn))
            {
                return fn(container);
            }
            else if ( container is System.Collections.IList )
            {
                var list = (System.Collections.IList )container;
                int pos;
                if (int.TryParse(name, out pos ) && list.Count > pos )
                {
                    return list[pos];
                }
            }
            return null;
            
        }
        public static System.Reflection.PropertyInfo  GetAlternateNamedProperty(this IAlternateNamingValueContainer container, string name)
        {
            return g_propDics.GetOrAdd(container.GetType(), CreatePropDic )[name];
        }

       
    }
}

