// -----------------------------------------------------------------------
// <copyright file="ObjectExtensions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Runtime.Serialization.Json;
    using Newtonsoft.Json;


    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public static class ObjectExtensions
    {
        public static T Get<T>(this Mozu.Content.Contracts.Document doc, string key, T defaultValue= default(T))
        {
            if (doc?.Properties == null)
            {
                return defaultValue;
            }

            if (!doc.Properties.TryGetValue(key, StringComparison.InvariantCultureIgnoreCase, out var tok))
                return defaultValue;
            try
            {
                return (T) tok.ToObject<T>();
            }
            catch
            {
                return defaultValue;
            }
        }

        public static bool TryGet<T>(this Mozu.Content.Contracts.Document doc, string key, out T value)
        {
            value = default;
            if (doc?.Properties == null)
            {
                return false;
            }

            if (!doc.Properties.TryGetValue(key, StringComparison.InvariantCultureIgnoreCase, out var tok))
                return false;
            //todo test if can be cast..
            try
            {
                value = (T) tok.ToObject<T>();
                return true;
            }
            catch
            {
            }
            return false;
        }
        

        public static void Set(this Mozu.Content.Contracts.Document doc, string key, object value)
        {
            if (doc == null )
            {
                throw new NullReferenceException("doc null");
            }
            if (doc.Properties == null)
            {
                doc.Properties = new JObject();
            }
            
            doc.Properties[key] = JToken.FromObject(value);
        }

        public static bool IsTruthy(this object obj)
        {
            switch (obj)
            {
                case string sobj when sobj.Length > 0:
                    return true;
                case bool bobj:
                    return bobj;
            }

            var str = Convert.ToString(obj);
            if (obj is string sobj2 && sobj2.Length > 0)
            {
                return true;
            }
            return !string.IsNullOrEmpty(str) && str != "0";
        }
        public static T Clone<T>(this object original)
        {
            T cloned;
            using (var stream = new MemoryStream())
            {

                var serializer = new DataContractJsonSerializer(typeof(T),new []{ typeof ( object[]) , typeof ( string[]), typeof ( decimal [])} );
                serializer.WriteObject(stream, original);
                
                stream.Position = 0;
                cloned = (T)serializer.ReadObject(stream);
            }
            return cloned;
        }
        public static T Map<T>( this object obj )
        {
            return AutoMapper.Mapper.Map<T>(obj);
        }

        public static string GetFilePathNameWithoutExtension(this string path)
        {
            var slashIndex = path.LastIndexOf('\\');
            if (slashIndex == -1)
            {
                slashIndex = 0;
            }
            var extIndex = path.IndexOf('.', slashIndex);
            return extIndex > 0 ? path.Substring(0, extIndex) : path;
        }


        public static T Map<T>(this object obj, T dest)
        {
            return AutoMapper.Mapper.Map( obj, dest);
        }
        public static IEnumerable<T> Flatten<T> ( this IEnumerable<T> col , Func<T,IEnumerable<T>> fn)
        {
            var list = new List<T>();
            var stack = new Stack<T>(col);

            while ( stack.Count > 0  )
            {
                var curr = stack.Pop();
                list.Add ( curr );
                var subItems = fn(curr);
                if (subItems == null) continue;
                foreach ( var subItem in subItems )
                {
                    if ( !list.Contains(subItem))
                    {
                        stack.Push(subItem);
                    }
                }
            }
            return list;
        }
        public static Exception UnwrapAgg(this Exception e)
        {
            while (e is AggregateException exception)
            {
                e = exception.InnerExceptions[0];
            }
            return e;
        }

        public static TValue GetOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> self, TKey key, TValue @default)
        {
            return self.TryGetValue(key, out var value) ? value : @default;
        }

        public static string BetweenStrings(this string self, string start, string stop, StringComparison stringComparison = StringComparison.OrdinalIgnoreCase)
        {
            if (self == null || start == null || stop == null)
                return null;

            var leftIndex = self.IndexOf(start, stringComparison) + start.Length;
            var rightIndex = self.IndexOf(stop, leftIndex, stringComparison);

            // guard against the search string not being found.
            if (rightIndex < 0 || leftIndex < 0 || (rightIndex < leftIndex) || (rightIndex > self.Length))
                return null;

            return self.Substring(leftIndex, rightIndex - leftIndex);
        }

        /// <summary>
        /// serializes and parses the object into a JObject
        /// </summary>
        /// <param name="self"></param>
        /// <param name="serSettings">If not provided, uses CaseInsensitiveJsonSerializerSettings.Default</param>
        /// <returns></returns>
        public static JObject ToJObject(this object self, JsonSerializerSettings serSettings = null)
        {
            return JObject.FromObject(self, JsonSerializer.CreateDefault(serSettings ?? CaseInsensitiveJsonSerializerSettings.Default));
        }

        /// <summary>
        /// serializes and parses the object into a JObject
        /// </summary>
        /// <param name="self"></param>
        /// <param name="serSettings">If not provided, uses CaseInsensitiveJsonSerializerSettings.Default</param>
        /// <returns></returns>
        public static JArray ToJArray(this object self, JsonSerializerSettings serSettings = null)
        {
            return JArray.FromObject(self, JsonSerializer.CreateDefault(serSettings ?? CaseInsensitiveJsonSerializerSettings.Default));
        }
    }
}
