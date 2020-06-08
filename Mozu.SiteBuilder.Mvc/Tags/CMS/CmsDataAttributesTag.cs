// -----------------------------------------------------------------------
// <copyright file="DataAttributesTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Linq;
using Mozu.SiteBuilder.UX.Models;
using NDjango.Interfaces;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using System.Runtime.Serialization.Json;
using Newtonsoft.Json.Linq;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.Mvc.Tags.Data
{

    [Obsolete]
    [Name("cms_data_attributes")]
    public class CmsDataAttributesTag : SimpleTagBase
    {
        static string Convert(Dictionary<String, object> mmd)
        {
            var sw = new StringWriter();
            object obj;
            var attributeName = "data-editing-element";
            if (mmd.TryGetValue("data-attribute-name", out obj))
            {
                attributeName = obj.ToString();
            }
            if (mmd.TryGetValue("data-editing", out obj))
            {
                var value = obj as JToken;
                if (value != null)
                {
                    value.WriteTo(new JsonTextWriter(sw) { Formatting = Formatting.None });
                }
                else if (obj is string || obj?.GetType().IsPrimitive == true)
                {
                    sw.Write(obj.ToString());
                }
                else
                {
                    var j = JToken.FromObject(obj);
                    j.WriteTo(new JsonTextWriter(sw) { Formatting = Formatting.None });
                }
            }
            else
            {
                var j = JToken.FromObject(obj);
                j.WriteTo(new JsonTextWriter(sw) { Formatting = Formatting.None });
            }

            return attributeName + "=\"" + HttpUtility.HtmlAttributeEncode(sw.GetStringBuilder().ToString()) + "\"";
        }

        static string ToJSName(string name)
        {
            return name;
        }


        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {
            var isEditmode = context.PageContext().IsEditMode;
            if (!isEditmode) return Enumerable.Empty<WalkResult>();

            Dictionary<string, object> mmd = null;

            var exp = arguments[0].TokenValue;
            var dotParts = exp.Split('.');
            var entry = context.tryfind(dotParts[0]);
            if (entry == null || entry.Value == null) return Enumerable.Empty<WalkResult>();

            var extractor = entry.Value as ICmsMetaDataExtrator;
            if (extractor == null) return Enumerable.Empty<WalkResult>();

            mmd = extractor.GetCmsModelMetadata(exp);
            if (arguments.Count > 1)
            {
                mmd["fieldType"] = arguments[1].TokenValue;
            }

            if (mmd == null) return Enumerable.Empty<WalkResult>();
            return WalkResultHelpers.Buffer(Convert(mmd)).ToFSharpList();
        }
    }
}
