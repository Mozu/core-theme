// -----------------------------------------------------------------------
// <copyright file="ObjectExtensions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Magnum.Binding.TypeBinders;
using Magnum.Extensions;
using Microsoft.FSharp.Core;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.IO;
    using System.Runtime.Serialization;
    using System.Runtime.Serialization.Formatters.Binary;
    using System.Runtime.Serialization.Json;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public static class ObjectExtensions
    {

        public static T Get<T>(this Mozu.Content.Contracts.Document doc, string key, T defaultValue= default(T))
        {
            if (doc == null || doc.Properties == null)
            {
                return defaultValue;
            }
            JToken tok;
            if (doc.Properties.CastAs<JObject>().TryGetValue(key, out tok))
            {
                try
                {
                    return (T) tok.ToObject<T>();
                }
                catch
                {
                    return defaultValue;
                }
            }
            return defaultValue;
            
        }

        public static bool TryGet<T>(this Mozu.Content.Contracts.Document doc, string key, out T  value)
        {
            if (doc == null || doc.Properties == null)
            {
                value = default (T);
                return false;
            }
          
            JToken tok;
            if (doc.Properties.CastAs<JObject>().TryGetValue(key, out tok))
            {
                //todo test if can be cast..
                try
                {
                    value = (T) tok.ToObject<T>();
                    return true;
                }
                catch
                {
                }

            }
            value = default(T);
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
            
            doc.Properties.CastAs<JObject>()[key] = JToken.FromObject(value);
        }

        public static bool IsTruthy(this object obj)
        {
            if (obj is string && ((string)obj).Length > 0)
            {
                return true;
            }
            if (obj is bool)
            {
                return (bool)obj;
            }

            var str = Convert.ToString(obj);
            if (obj is string && ((string)obj).Length > 0)
            {
                return true;
            }
            return str != null && str.Length > 0 && str != "0";
        }
        public static T Clone<T>(this object original)
        {

            //IFormatter formatter = new BinaryFormatter();
            //Stream stream = new MemoryStream();
            //using (stream)
            //{
            //    formatter.Serialize(stream, original);
            //    stream.Seek(0, SeekOrigin.Begin);
            //    return (T)formatter.Deserialize(stream);
            //}


            T cloned;
            using (MemoryStream stream = new MemoryStream())
            {

                DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(T),new Type[]{ typeof ( object[]) , typeof ( string[]), typeof ( decimal [])} );
                serializer.WriteObject(stream, original);
                
                stream.Position = 0;
                cloned = (T)serializer.ReadObject(stream);
            }
            return (T)cloned;
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
            List<T> list = new List<T>();
            var stack = new Stack<T>(col);

            while ( stack.Count > 0  )
            {
                var curr = stack.Pop();
                list.Add ( curr );
                var subItems = fn(curr);
                if ( subItems != null )
                {
                    foreach ( var subItem in subItems )
                    {
                        if ( !list.Contains ( subItem ))
                        {
                            stack.Push ( subItem );
                        }
                    }
                }
            }

            return list;

        }
        public static Exception UnwrapAgg(this Exception e)
        {
            while (e is AggregateException)
            {
                e = ((AggregateException)e).InnerExceptions[0];
            }
            return e;
        }

        public static TValue GetOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> self, TKey key, TValue @default)
        {
            TValue value;
            return self.TryGetValue(key, out value) ? value : @default;
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
    }
}
