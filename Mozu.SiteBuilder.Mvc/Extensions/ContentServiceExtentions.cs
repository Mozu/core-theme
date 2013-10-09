// -----------------------------------------------------------------------
// <copyright file="ContentServiceExtentions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.Content.Contracts;


    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public static class ContentServiceExtentions
    {
        public static string ToWidgetStem(this Document doc)
        {
            return doc.DocumentListName + doc.Id;
        }

        public static Document Set(this Document doc, string key, object value)
        {
            doc.Properties = doc.Properties ?? new List<PropertyValue>();
            var kvp = doc.Properties.FirstOrDefault(x => x.PropertyType == key);
            if (kvp == null)
            {
                kvp = new PropertyValue()
                {
                    PropertyType = key
                };
                doc.Properties.Add(kvp);
            }
            kvp.Value = value;
            return doc;
        }

        public static Models.CMS.Admin.Document Set(this Models.CMS.Admin.Document doc, string key, object value)
        {
            doc.Items = doc.Items ?? new List<Models.CMS.Admin.DocumentProperty>();
            var kvp = doc.Items.FirstOrDefault(x => x.Key == key);
            if (kvp == null)
            {
                kvp = new Models.CMS.Admin.DocumentProperty()
                {
                    Key = key
                };
                doc.Items.Add(kvp);
            }
            kvp.Value = value;
            return doc;
        }

        public static object Get(this Models.CMS.Admin.Document doc, string key)
        {
            if (doc.Items == null)
            {
                return null;
            }
            return doc.Items.Where(x => x.Key == key).Select(x => x.Value).FirstOrDefault();
        }

        public static object Get(this Document doc, string key)
        {
            if (doc.Properties == null)
            {
                return null;
            }
            return doc.Properties.Where(x => x.PropertyType == key).Select(x => x.Value).FirstOrDefault();
        }

        public static T Get<T>(this Document doc, string key)
        {
           
            return Get<T>(doc, key, default(T));
        }
        public static T Get<T>(this Document doc, string key, T defaulltValue)
        {
            if (doc == null || doc.Properties == null)
            {
                return defaulltValue;
            }
            object obj = doc.Properties.Where(x => x.PropertyType == key).Select(x => x.Value).FirstOrDefault();
            if (obj != null)
            {
                return (T)Convert.ChangeType(obj, typeof(T));
                
            }
            return defaulltValue;
        }
        public static bool TryGet<T>(this Document doc, string key, out T value)
        {
            value = default(T);
            if (doc == null || doc.Properties == null)
            {
                return false ;
            }
            object obj = doc.Properties.Where(x => x.PropertyType == key).Select(x => x.Value).FirstOrDefault();
            if (obj != null)
            {
                value= (T)Convert.ChangeType(obj, typeof(T));
                return true;

            }
            return false;
        }
    }
}
