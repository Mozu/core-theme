// -----------------------------------------------------------------------
// <copyright file="DataAttributesTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Json;
using Mozu.SiteBuilder.UX.Models;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Tags.Data
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    using System.Web.Routing;

    using System.Web;
    using System.IO;
    using System.Runtime.Serialization;
    using System.Runtime.Serialization.Json;
    using System.Xml;
    using Mozu.SiteBuilder.UX.Models.ModelMetaData;

    [Obsolete]
    [NDjango.Interfaces.Name("cms_data_attributes")]
    public class CmsDataAttributesTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = null;
            templateName = null;
            var isEditmode = context.PageContext().IsEditMode;

            if (!isEditmode)
                return ;

            var obj = arguments[0].Value;
            Dictionary<string,object > mmd = null;

            var exp = arguments[0].TokenValue;
            var dotParts = exp.Split('.');
            var entry = context.tryfind(dotParts[0]);
            if (entry != null && entry.Value != null)
            {
                var extractor = entry.Value as ICmsMetaDataExtrator;
                if (extractor != null )
                {
                    mmd = extractor.GetCmsModelMetadata( exp);
                    if (arguments.Count > 1)
                    {
                        mmd["fieldType"] = arguments[1].TokenValue;
                    }
                }

                if (mmd != null)
                {
                    buffer = Convert(mmd);
                }
            }
            return;

        }
        string Convert(Dictionary<String,object> mmd)
        {

            var sw = new StringWriter();
            object obj;
            string attributeName = "data-editing-element";
            if (mmd.TryGetValue("data-attribute-name", out obj))
            {
                attributeName = obj.ToString();
            }
            if (mmd.TryGetValue("data-editing", out obj))
            {
                if (obj is JsonValue)
                {
                    ((JsonValue)obj).Save(sw, JsonSaveOptions.None);
                }
                if (obj is Newtonsoft.Json.Linq.JObject)
                {
                    ((Newtonsoft.Json.Linq.JObject)obj).WriteTo(new JsonTextWriter(sw) { Formatting = Newtonsoft.Json.Formatting.None });
                }
                else if (obj is string)
                {
                    sw.Write((string)obj);
                }
                else
                {
                    var jv = JsonValueExtensions.CreateFrom(obj);
                    jv.Save(sw, JsonSaveOptions.None);

                }
            }
            else
            {
                var json = new JsonObject();
                JsonPrimitive jPrim;

                if (mmd != null)
                {
                    foreach (var item in mmd)
                    {
                        if (JsonPrimitive.TryCreate(item.Value, out jPrim))
                        {
                            json[ToJSName(item.Key)] = jPrim;
                        }

                    }
                }
                //todo: should we use anything from modelMetaData propper
                //foreach (System.ComponentModel.PropertyDescriptor prop in System.ComponentModel.TypeDescriptor.GetProperties(mmd))
                //{
                //    if (!(prop.PropertyType == typeof(string) || prop.PropertyType.IsValueType) || prop.PropertyType == typeof(Type))
                //    {
                //        continue;
                //    }

                //    var val = prop.GetValue(mmd);
                //    if (JsonPrimitive.TryCreate(val, out jPrim))
                //    {
                //        json[ToJSName(prop.Name)] = (JsonValue)jPrim;
                //    }

                //}




                json.Save(sw, JsonSaveOptions.None);
            }

            return attributeName + "=\"" + HttpUtility.HtmlAttributeEncode(sw.GetStringBuilder().ToString()) + "\"";


        }
        string ToJSName(string name)
        {
            return name;
            //switch (name)
            //{
            //    case "PropertyName":
            //        {
            //            return "fieldName";
            //        }
            //    default:
            //        {
            //            if (char.IsLower(name[0]))
            //            {
            //                return name;
            //            }
            //            return char.ToLower(name[0]) + name.Substring(1);
            //        }
            //}
        }
        //void   Append(StringBuilder sb , string key , object value )
        // {

        //     if (value == null)
        //         return;
        //     if (value.GetType () == typeof(Type))
        //         value = ((Type)value).Name;
        //     else if (value is Boolean)
        //     {
        //         value = value.ToString().ToLowerInvariant();
        //     }
        //   //  StringBuilder sb = new StringBuilder();

        //     if (sb.Length > 0)
        //         sb.Append(" ");
        //     sb.Append("data-").Append(key).Append("=\"").Append(HttpUtility.HtmlAttributeEncode(value.ToString())).Append("\"");




        // }

       
       
    }
}
