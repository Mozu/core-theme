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
    [NDjango.ParserNodes.Description("wrapper of MVC HTML ActionLink Extension")]
    [NDjango.Interfaces.Name("data_attributes")]
    public class DataAttributesTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var isEditmode = context.PageContext().IsEditMode;
            
            if (!isEditmode)
                return ;

            var obj = arguments[0].Value;
            Dictionary<string,object> mmd = null;
            if (obj != null)
            {
                if (obj is IModelMetadataContainer )
                {
                    var cont = (IModelMetadataContainer)obj;
                    mmd = cont.GetModelMetadata();
                   
                }
            }
            var exp = arguments[0].TokenValue;
            var dotParts = exp.Split('.');
            if (obj is IModelMetadataAncestorDependantItem)
            {
                var context2 = context;
                var item = (IModelMetadataAncestorDependantItem)obj;
                var ancestors = dotParts.Reverse().Select(x => context2.tryfind(x) ).Where ( x=> x!= null ).Select ( x=>x.Value ).ToList();
                
                mmd = item.GetModelMetadata(ancestors);
            }
            if (mmd == null)
            {
                //todo:  totally refactor this beatch
                if (dotParts.Length ==2)
                {
                    var entry = context.tryfind(dotParts[0]);
                    if (entry != null && entry.Value != null)
                    {
                        var parentObj = entry.Value;
                        if (parentObj is IModelMetadataParentContainer)
                        {
                            var cont = (IModelMetadataParentContainer)parentObj;
                            mmd = cont.GetModelMetadata(dotParts[1]);
                        }


                    }
                }
                else if(dotParts.Length > 2)
                {
                    var  entry = context.tryfind(dotParts[0]);
                    if (entry != null && entry.Value != null)
                    {
                        var parentObj = entry.Value;
                        for (int i = 1; i < dotParts.Length ; i++)
                        {
                            object childObj = null;
                            if (parentObj is System.Collections.IDictionary)
                            {
                                try
                                {
                                    childObj = ((System.Collections.IDictionary) parentObj)[dotParts[i]];
                                }
                                catch
                                {
                                    break;
                                }
                            }
                            if (childObj == null && parentObj is IDictionary<string, object>)
                            {
                                try
                                {
                                    childObj = ((IDictionary<string, object>)parentObj)[dotParts[i]];
                                }
                                catch
                                {
                                    break;
                                }
                            }
                            //todo: add support for normal property reflection
                            //if (childObj == null &&  parentObj is IAlternateNamingValueContainer)
                            //{
                            //    try
                            //    {
                            //        childObj = ((IAlternateNamingValueContainer) parentObj).GetAlternateNamedProperty(dotParts[i]);
                            //    }
                            //    catch 
                            //    {
                            //        break;
                            //    }
                            //}
                            if( childObj == null )
                            {
                                break;
                            }
                            parentObj = childObj;
                            if ( i == dotParts.Length-1  )
                            {
                                if (childObj is IModelMetadataContainer)
                                {
                                    var cont = (IModelMetadataContainer)childObj;
                                    mmd = cont.GetModelMetadata();
                                    
                                }
                                if (mmd == null && childObj is IModelMetadataAncestorDependantItem)
                                {
                                    var context2 = context;
                                    var item = (IModelMetadataAncestorDependantItem)childObj;
                                    var ancestors = dotParts.Reverse().Select(x => context2.tryfind(x)).Where(x => x != null).Select(x => x.Value).ToList();

                                    mmd = item.GetModelMetadata(ancestors);
                                }
                            }
                            else if ( i == dotParts.Length -2 )
                            {
                                if (childObj is IModelMetadataParentContainer)
                                {
                                    var cont = (IModelMetadataParentContainer)childObj;
                                    mmd = cont.GetModelMetadata(dotParts[dotParts.Length -1]);
                                    
                                }
                            }
                            if ( mmd != null )
                            {
                                break;
                                
                            }
                            
                        }
                    }
                    
                    
                }

            }
            if ( mmd == null )
            {
                //todo:refactor away from mmd
                System.Diagnostics.Debug.WriteLine("refactor away from mmd");
            }
            if (mmd != null)
            {
                buffer = Convert(mmd);
            }
            return ;

        }
        string Convert ( Dictionary<string,object > mmd )
        {
            
            var sw = new StringWriter();
            object  obj;
            string attributeName = "data-editing-element";
            if (mmd.TryGetValue("data-attribute-name", out obj))
            {
                attributeName = obj.ToString();
            }
            if ( mmd.TryGetValue ( "data-editing", out obj ))
            {  
                if (obj is JsonValue)
                {
                    ((JsonValue)obj).Save(sw, JsonSaveOptions.None);
                }
                if (obj is Newtonsoft.Json.Linq.JObject)
                {
                    ((Newtonsoft.Json.Linq.JObject) obj).WriteTo(new JsonTextWriter(sw) {Formatting = Newtonsoft.Json.Formatting.None});
                }
                else if (obj is string)
                {
                    sw.Write((string)obj);
                }
                else
                {
                    var jv =  JsonValueExtensions.CreateFrom(obj);
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

            return  attributeName +  "=\"" + HttpUtility.HtmlAttributeEncode(sw.GetStringBuilder().ToString()) + "\"";
           
            
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
