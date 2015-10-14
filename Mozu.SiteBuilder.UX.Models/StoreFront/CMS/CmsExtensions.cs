//doto:deleteme
//// -----------------------------------------------------------------------
//// <copyright file="CmsExtensions.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------
//using C = Mozu.Content.Contracts;

//namespace Mozu.SiteBuilder.Mvc.Models.CMS
//{
//    using System;
//    using System.Collections.Generic;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    public static class CmsExtensions
//    {
//        public static object GetValue ( this Admin.Document doc, string key)
//        {
//            if (doc.Items == null)
//                return null;
//            foreach (var item in doc.Items)
//            {
//                if (item.Key == key)
//                    return item.Value;
                
//            }
//            return null;
//        }
//        public static bool ContainsValue<T> (this Mozu.Content.Contracts.Document doc, string key, T value)
//        {
//            return ContainsValue<T>(doc, key, value, Comparer<T>.Default);
//        }
//        public static bool ContainsValue<T>(this Mozu.Content.Contracts.Document doc, string key, T value, IComparer<T> comparer)
//        {
//            Type t = typeof(T);
//            if (doc.Properties == null)
//                return false;
//            foreach (var item in doc.Properties)
//            {
//                if (item.PropertyType == key)
//                {
//                    if (item.Value  is object[])
//                    {
//                        foreach (object obj in (object[])item.Value )
//                        {
//                            if (obj is T)
//                            {
//                                if (comparer.Compare((T)obj, value) == 0)
//                                {
//                                    return true;
//                                }
//                            }
//                        }
//                    }
//                    else if (item.Value is T)
//                    {
//                        return comparer.Compare((T)item.Value, value ) == 0;
//                    }
//                }


//            }
//            return false;
//        }
//    }
//}
