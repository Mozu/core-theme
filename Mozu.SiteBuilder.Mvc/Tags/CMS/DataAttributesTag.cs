// -----------------------------------------------------------------------
// <copyright file="DataAttributesTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections;
using System.Json;
using NDjango.Interfaces;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Runtime.Serialization.Json;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.Mvc.Tags.Data
{
    [Obsolete]
    [NDjango.ParserNodes.Description("wrapper of MVC HTML ActionLink Extension")]
    [Name("data_attributes")]
    public class DataAttributesTag : SimpleTagBase
    {
        string Convert (IReadOnlyDictionary<string, object> mmd )
        {
            var sw = new StringWriter();
            object  obj;
            var attributeName = "data-editing-element";
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

                foreach (var item in mmd)
                {
                    JsonPrimitive jPrim;
                    if (JsonPrimitive.TryCreate(item.Value, out jPrim))
                    {
                        json[ToJSName(item.Key)] = jPrim;
                    }
                }

                json.Save(sw, JsonSaveOptions.None);
            }

            return  attributeName +  "=\"" + HttpUtility.HtmlAttributeEncode(sw.GetStringBuilder().ToString()) + "\"";
        }

        public string ToJSName(string name)
        {
            return name;
        }
        
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {
            var isEditmode = context.PageContext().IsEditMode;
            if (!isEditmode) return Enumerable.Empty<WalkResult>();

            var obj = arguments[0].Value;
            Dictionary<string, object> mmd = null;
            if (obj != null)
            {
                var container = obj as IModelMetadataContainer;
                if (container != null)
                {
                    var cont = container;
                    mmd = cont.GetModelMetadata();

                }
            }
            var exp = arguments[0].TokenValue;
            var dotParts = exp.Split('.');
            var dependantItem = obj as IModelMetadataAncestorDependantItem;
            if (dependantItem != null)
            {
                var context2 = context;
                var item = dependantItem;
                var ancestors = dotParts.Reverse().Select(context2.tryfind).Where(x => x != null).Select(x => x.Value).ToList();

                mmd = item.GetModelMetadata(ancestors);
            }
            if (mmd == null)
            {
                //todo:  totally refactor this beatch
                if (dotParts.Length == 2)
                {
                    var entry = context.tryfind(dotParts[0]);
                    if (entry != null && entry.Value != null)
                    {
                        var parentObj = entry.Value;
                        var container = parentObj as IModelMetadataParentContainer;
                        if (container != null)
                        {
                            var cont = container;
                            mmd = cont.GetModelMetadata(dotParts[1]);
                        }
                    }
                }
                else if (dotParts.Length > 2)
                {
                    var entry = context.tryfind(dotParts[0]);
                    if (entry != null && entry.Value != null)
                    {
                        var parentObj = entry.Value;
                        for (int i = 1; i < dotParts.Length; i++)
                        {
                            object childObj = null;
                            var dictionary = parentObj as IDictionary;
                            if (dictionary != null)
                            {
                                try
                                {
                                    childObj = dictionary[dotParts[i]];
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
                            if (childObj == null)
                            {
                                break;
                            }
                            parentObj = childObj;
                            if (i == dotParts.Length - 1)
                            {
                                var container = childObj as IModelMetadataContainer;
                                if (container != null)
                                {
                                    var cont = container;
                                    mmd = cont.GetModelMetadata();
                                }
                                if (mmd == null && childObj is IModelMetadataAncestorDependantItem)
                                {
                                    var context2 = context;
                                    var item = (IModelMetadataAncestorDependantItem)childObj;
                                    var ancestors = dotParts.Reverse().Select(context2.tryfind).Where(x => x != null).Select(x => x.Value).ToList();

                                    mmd = item.GetModelMetadata(ancestors);
                                }
                            }
                            else if (i == dotParts.Length - 2)
                            {
                                var container = childObj as IModelMetadataParentContainer;
                                if (container != null)
                                {
                                    var cont = container;
                                    mmd = cont.GetModelMetadata(dotParts[dotParts.Length - 1]);
                                }
                            }
                            if (mmd != null)
                            {
                                break;
                            }
                        }
                    }
                }
            }
            if (mmd == null)
            {
                System.Diagnostics.Debug.WriteLine("refactor away from mmd");
                return Enumerable.Empty<WalkResult>();
            }

            return WalkResultHelpers.Buffer(Convert(mmd)).ToFSharpList();
        }
    }
}
