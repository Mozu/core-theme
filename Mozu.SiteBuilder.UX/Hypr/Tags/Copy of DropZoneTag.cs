using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Json;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using AutoMapper;
using Microsoft.FSharp.Collections;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
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
    public static class ExtensionMethods
    {
        public static StringBuilder AppendJson(this StringBuilder sb, object obj)
        {
            sb.Append(Newtonsoft.Json.JsonConvert.SerializeObject(obj, CaseInsensitiveJsonSerializerSettings.Default));
            return sb;
        }

        public static StringBuilder AppendJsonHtmlAttributeEncoded(this StringBuilder sb, object obj)
        {
            sb.Append(HttpUtility.HtmlAttributeEncode(Newtonsoft.Json.JsonConvert.SerializeObject(obj, CaseInsensitiveJsonSerializerSettings.Default)));
            return sb;
        }

        public static StringBuilder AppendJsonHtmlAttribute(this StringBuilder sb, object obj, string name)
        {
            sb.Append(" data-");
            sb.Append(name);
            sb.Append("=\"");
            sb.Append(HttpUtility.HtmlAttributeEncode(Newtonsoft.Json.JsonConvert.SerializeObject(obj, CaseInsensitiveJsonSerializerSettings.Default)));
            sb.Append("\" ");
            return sb;
        }

    }


    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("cms_resources")]
    public class EditResourcesTag : SimpleTagBase
    {

        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var pageContext = context.PageContext();
            var isEditmode = pageContext.IsEditMode;
            var sb = new StringBuilder();
            sb.AppendLine("\t\t<link rel=\"stylesheet\" href=\"/resources/cms/layout.css\">");
            if (!isEditmode)
            {
                
                buffer = sb.ToString();
                return;
            }
           
            sb.AppendLine( "\r\n\t\t<link rel=\"stylesheet\" href=\"/admin/scripts/build/chorizo/chorizo.css\">");
            sb.AppendLine("\t\t<link rel=\"stylesheet\" href=\"//netdna.bootstrapcdn.com/font-awesome/4.0.2/css/font-awesome.min.css\">");
            sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>");
            sb.AppendLine("\t\t<script src=\"//code.jquery.com/ui/1.10.3/jquery-ui.js\"></script>");
            var format = "\t\t<script type=\"text/javascript\" src=\"/admin/scripts/chorizo/{0}.js\"></script>\r\n";
            sb.AppendFormat(format,"_classfactory");
            sb.AppendFormat(format, "format");
            sb.AppendFormat(format,"content");
            sb.AppendFormat(format,"targets");
            sb.AppendFormat(format, "widgets");
            sb.AppendFormat(format, "editor");
            buffer = sb.ToString();
        }
    }

    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("dropzone")]
    public class DropZoneTag2 : SimpleTagBase
    {

        public static object HTTPCONTEXTKEY = new object();

        public class ZoneData
        {
            public string id { get; set; }
            public string scope { get; set; }
        }

        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var httpContext = context.HttpContext();
            var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
            var scope = arguments.GetValueOrDefault<string>("scope", null);
            if (string.IsNullOrEmpty(scope))
            {
                if (arguments.Count > 1 && arguments[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
                {
                    scope = (string) arguments[1].Value;
                }
                else
                {
                    scope = "page";
                }
            }
            var zoneSpan = arguments.GetValueOrDefault<int>("span", 12);
            var zoneId = arguments.GetValueOrDefault<string>("zoneId") ?? (string) arguments.First().Value;
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
             


            if (pageContext.CmsContext != null && !pageContext.CmsContext.Initialized)
            {
                var cmsHelper = context.Resolve<CmsHelper>();
                cmsHelper.InitCmsPageContext(pageContext).Wait();
            }


            scope = scope.ToLowerInvariant();



            isEditmode = isEditmode && string.Equals(scope, pageContext.EditMode.GetValueOrDefault(EditModes.page ).ToString(), StringComparison.OrdinalIgnoreCase);

            var zoneRuntimeData = (pageContext.CmsContext == null || pageContext.CmsContext.RuntimeData2 == null) ? null : pageContext.CmsContext.RuntimeData2.FirstOrDefault(x => string.Equals(x.Id, zoneId, StringComparison.OrdinalIgnoreCase));
            bool useDefaultId = true;
            var sb = new StringBuilder();
            sb.Append("<div class=\"mz-drop-zone");
            if (isEditmode)
            {
                sb.Append(" mz-cms-editing mz-cms-grid\" ");
                sb.AppendJsonHtmlAttribute(new
                                               {
                                                   id = zoneId,
                                                   scope = scope,
                                                   span = zoneSpan,
                                                   source = zoneRuntimeData == null ? null : zoneRuntimeData.Source
                                               }, "drop-zone");


            }
            else
            {
                sb.Append("\" ");
            }




            sb.Append(">");
            
            var sw = new StringWriter(sb);

            if (zoneRuntimeData != null && zoneRuntimeData.Rows != null && zoneRuntimeData.Rows.Count > 0)
            {

                foreach (var row in zoneRuntimeData.Rows)
                {
                    sb.Append("<div class=\"mz-cms-row\">");
                    if (row.Columns == null || row.Columns.Count == 0)
                    {
                        continue;
                    }

                    foreach (var column in row.Columns)
                    {
                        if (column.Widgets == null || column.Widgets.Count == 0)
                        {
                            continue;
                        }
                        sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\">", column.Span, zoneSpan);

                        foreach (var widget in column.Widgets)
                        {
                            bool isContent = widget.DefinitionId == "content";
                            widget.isRichText = isContent;
                            
                            WidgetDefinition widgetDefinition = null;
                            widgetDefinition = themeEntityDefinitionProvider.GetWidgetDefintion(widget.DefinitionId);
                            if (widgetDefinition == null)
                            {
                                continue;
                            }



                            sb.Append("<div class=\"mz-cms-block\" ");

                            if (isEditmode)
                            {
                                sb.AppendJsonHtmlAttribute(widget, "widget");
                            }
                            
                            sb.Append(">");
                            sb.Append("<div class=\"mz-cms-content\"");

                            var height = ((Newtonsoft.Json.Linq.JObject)widget.Config)["height"];

                            if (height != null)
                            {
                                sb.Append(" style=\"height:");
                                sb.Append(height);
                                sb.Append("px;\"");
                            }
                            sb.Append(">");

                            if (isContent)
                            {

                                sb.Append((string)((Newtonsoft.Json.Linq.JObject ) widget.Config)["body"]);
                            }
                            else
                            {
                                context.Render("widgets/" + widgetDefinition.DisplayTemplate, widget, sw);
                            }

                            sb.Append("</div>");
                            sb.Append("</div>");
                        }
                        sb.Append("</div>");


                    }
                    sb.Append("</div>");
                }
               


            }
            else
            {
                //if (isEditmode)
                //{
                //    sb.Append("<div class=\"mz-cms-row\">");
                   
                //    sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\">", zoneSpan,12);
                //    sb.Append("<div class=\"mz-cms-block\" ");
                //    sb.AppendJsonHtmlAttribute(new ZoneWidgetRuntimeData()
                //    {

                //    }, "widget");
                    
                //    sb.Append(">");
                //    sb.Append("<div class=\"mz-cms-content\">");
                //    sb.Append("</div>");
                //    sb.Append("</div>");
                //    sb.Append("</div>");
                //    sb.Append("</div>");
                //    sb.Append("<br><br>");
                //}
            }
            sb.Append("</div>");
            buffer = sb.ToString();
        }


        private bool HasVisited(string zoneId, HttpContextBase httpContext)
        {

            if (httpContext == null || httpContext.Items == null)
            {
                return false;
            }
            var hs = (System.Collections.Generic.HashSet<string>) httpContext.Items[HTTPCONTEXTKEY];
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