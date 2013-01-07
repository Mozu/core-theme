// -----------------------------------------------------------------------
// <copyright file="ObjectExtensions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

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
    }
}
