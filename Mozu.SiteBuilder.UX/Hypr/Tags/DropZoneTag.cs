using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Json;
using System.Linq;
using System.Text;
using System.Web;

using AutoMapper;
using Microsoft.FSharp.Collections;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NDjango.Interfaces;
using Microsoft.FSharp.Core;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("dropzone_old")]
    public class DropZoneTag : SimpleTagBase
    {
        public static object HTTPCONTEXTKEY = new object();

       

        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
           
            buffer = templateName = null;
            var httpContext = context.HttpContext();
            var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
            var scope = arguments.GetValueOrDefault<string>("scope", "page");
            var zoneId = arguments.GetValueOrDefault<string>("zoneId") ?? (string)arguments.First().Value;
            var htmlAttributes = arguments.GetValueOrDefault<IDictionary<string, object>>("htmlAttributes");
            var siteContext = context.SiteContext();
            var pageContext = context.PageContext();
            var isEditmode = pageContext.IsEditMode;
            var viewContext = context.ViewContext();
            
            if (HasVisited(zoneId, httpContext))
            {
                throw new RenderingError("Zone " + zoneId + "already rendered", null);
            }


            if (!scope.Equals("page", StringComparison.OrdinalIgnoreCase))
            {
                scope = scope.ToLowerInvariant();
                if (scope != "template" && scope != "site")
                {
                    throw new Exception("invalid scope type " + scope);
                }
            }
            scope = scope.ToLowerInvariant();
            bool useDefaultId = true;
            var sb = new StringBuilder();
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
                    sb.Append(HttpUtility.HtmlAttributeEncode(att.Value.ToString()));
                    sb.Append("\" ");
                }
            }
            if (useDefaultId)
            {
                sb.Append("id=\"dropzone-");
                sb.Append(zoneId);
                sb.Append("\" ");
            }

            StringWriter sw;
            if (isEditmode && string.Equals(scope, pageContext.EditMode.GetValueOrDefault(EditModes.page).ToString(), StringComparison.InvariantCultureIgnoreCase))
            {
                var jobj = new JsonObject();
                var dJ = jobj.AsDynamic();
                dJ["zoneId"] = zoneId;
                dJ["zoneScope"] = scope;
                sb.AppendFormat("data-editing-zone-scope=\"{0}\" ", scope ?? "page");
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
            sb.Append(">");
            sb.AppendLine();

           







            if (
                pageContext.CmsContext != null &&
                pageContext.CmsContext.RuntimeData != null)
            {


                var zoneWidgets = pageContext.CmsContext.RuntimeData.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).OrderBy(x => x.Index).ToList();

                //StringBuilder sb = new StringBuilder();
                // var tw = new StringWriter();
                foreach (var zw in zoneWidgets)
                {
                    if (zw.Definition == null)
                    {
                        zw.Definition = themeEntityDefinitionProvider.GetWidgetDefintion(zw.DefinitionId);
                    }
                    if (zw.Definition == null)
                    {
                        continue;
                    }

                   
                    context.Render("widgets/" + zw.Definition.DisplayTemplate, zw, sw);
                    


                }

            }

            sw.Write("</div>");
            //todo:super ineffecient.
            buffer = sw.GetStringBuilder().ToString();
        }

        bool HasVisited(string zoneId , HttpContextBase httpContext  )
        {

            if (httpContext == null || httpContext.Items == null)
            {
                return false;
            }
            var hs = (System.Collections.Generic.HashSet<string>)httpContext.Items[HTTPCONTEXTKEY];
            if (hs == null)
            {
                httpContext.Items[HTTPCONTEXTKEY] = hs = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase);
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
    }
}