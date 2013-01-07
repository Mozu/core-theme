// -----------------------------------------------------------------------
// <copyright file="DropZone.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Json;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc;
    using System.Web;
    using System.IO;
    using System.Web.Mvc.Html;
    using Mozu.SiteBuilder.Mvc.Models.CMS;

    [NDjango.Interfaces.Name("dropzone")]
    public class DropZoneTag : DynamicTagBase
    {
        public static object HTTPCONTEXTKEY = new object();
        public MvcHtmlString Process(string zoneId)
        {
            return Process(zoneId, null, null );
        }
        public MvcHtmlString Process(string zoneId, string scope)
        {
            return Process(zoneId, scope, null);
        }

        public MvcHtmlString Process(string zoneId, IDictionary<string, object> htmlAttributes)
        {
            return Process(zoneId, null, htmlAttributes);
        }
        bool HasVisited(string zoneId)
        {
            
            if (HttpContext.Current == null || HttpContext.Current.Items == null)
            {
                return false;
            }
            var hs = (HashSet<string>)HttpContext.Current.Items[HTTPCONTEXTKEY];
            if (hs == null)
            {
                HttpContext.Current.Items[HTTPCONTEXTKEY] = hs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            }
            if (hs.Contains(zoneId))
            {
                return true;
            }
            else
            {
                hs.Add(zoneId);
                return false;
            }
            
        }
        public MvcHtmlString Process(string zoneId, string scope, IDictionary<string, object> htmlAttributes )
        {
            if (HasVisited(zoneId))
            {
                return new MvcHtmlString("!<-- warning:  redundant drop zone tag " + zoneId + " -->");
            }
            bool useDefaultId = true;
            StringBuilder sb = new StringBuilder();
            sb.Append("<div ");
            if (htmlAttributes != null)
            {
                foreach (var att in htmlAttributes)
                {
                    if (att.Key.ToLower() == "id")
                    {
                        useDefaultId = false;
                    }
                    sb.Append(att.Key);
                    sb.Append("=\"");
                    sb.Append(HttpUtility.HtmlAttributeEncode(att.Value.ToString ()));
                    sb.Append("\" ");
                }
            }
            if (useDefaultId)
            {
                sb.Append("id=\"dropzone-");
                sb.Append(zoneId);
                sb.Append("\" ");
            }
            var isEditmode = SiteBuilderContext.Current.IsEditMode;
            StringWriter sw;
            if (isEditmode)
            {
                var jobj = new JsonObject();
                var dJ = jobj.AsDynamic();
                dJ["zoneId"] = zoneId;
                dJ["zoneScope"] = scope;
                sb.Append("data-editing-zone=\"");
                sw = new StringWriter();
                jobj.Save(sw, JsonSaveOptions.None);
                var json = sw.GetStringBuilder().ToString();
                sw = new StringWriter(sb);
                HttpUtility.HtmlAttributeEncode(json, sw);
                sb.Append("\"");
            }
            else
            {
                sw = new StringWriter(sb);
            }
            sb.Append (">");
            sb.AppendLine();
            var mvcString = this.Html.Action("Zone", "Widgets",   new {zoneId= zoneId,    area = "storefront" });
            sw.Write(mvcString.ToString());
            sw.Write("</div>");
            return new MvcHtmlString(sw.GetStringBuilder().ToString());
            
        } 
    }

    
}
