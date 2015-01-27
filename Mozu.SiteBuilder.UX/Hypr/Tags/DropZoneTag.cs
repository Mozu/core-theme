using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;
using NDjango.FiltersCS.Compatibility;
using Mozu.Core.Extensions;

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

    /// <summary>
    /// adds the necessary scripts and styles for page editing.
    /// 
    /// 
    /// </summary>
    [NDjango.Interfaces.Name("cms_resources")]
    public class EditResourcesTag : SimpleTagBase
    {
        const string  Format = "\t\t<script type=\"text/javascript\" src=\"{1}/admin/scripts/chorizo/{0}.js\"></script>\r\n";

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var pageContext = context.PageContext();
            var cdnHost = Core.Settings.MozuConfigurationManager.AppSettings("CdnHost");
            var cdn = Core.Settings.MozuConfigurationManager.AppSettings("disableCDN") == "true" || string.IsNullOrEmpty(cdnHost)
                ? ""
                : ("//" + cdnHost + "/common");

            var isEditmode = pageContext.IsEditMode;
            using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
            {
                var sb = sbItemDisposer.Item;
                //var cdn = context.Resolve<SiteContext>().CdnPrefix;
                sb.AppendFormat("\t\t<link rel=\"stylesheet\" href=\"{0}/resources/cms/layout.css\">\r", cdn);
                if (!isEditmode)
                {
                    return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
                }

                sb.AppendLine("\r\n\t\t<link rel=\"stylesheet\" href=\"/admin/scripts/chorizo/build/chorizo.css\">");
                sb.AppendLine("\t\t<link rel=\"stylesheet\" href=\"//netdna.bootstrapcdn.com/font-awesome/4.0.2/css/font-awesome.min.css\">");
                sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>");
#if DEBUG
                sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.js\"></script>");
#else
            sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js\"></script>");
#endif
                sb.AppendFormat(Format, "_classfactory", cdn);
                sb.AppendFormat(Format, "format", cdn);
                sb.AppendFormat(Format, "content", cdn);
                sb.AppendFormat(Format, "targets", cdn);
                sb.AppendFormat(Format, "widgets", cdn);
                sb.AppendFormat(Format, "editor", cdn);


                return new[] { WalkResultHelpers.Buffer(sb.ToString()) }; 
            }
        }
    }


    /// <summary>
    /// creates a dropzone for the page.
    /// 
    /// takes 2 paramaters
    /// 
    /// [required]
    /// zoneId: unique identifier for the template
    /// designeates the id of the zone.  Zone ids need to be uninqe in the template or extended template or included template(s)
    /// 
    /// 
    /// [optional]
    /// scope:  either Page|Template|Site
    /// scope denotes the editing context for the zone.
    /// if omitted Page scope is assumed
    /// 
    /// Page = content is only managed for this page.
    /// Template = content is shared for all pages using this template
    /// Site = content is shared for all templates that extend this site template
    /// 
    /// <code>{%dropzone zoneId="bodybottom" scope="template" %}</code>
    /// </summary>
   
    [NDjango.Interfaces.Name("dropzone")]
    public class DropZoneTag2 : SimpleTagBaseAsync
    {

        public static object HTTPCONTEXTKEY = new object();

        public class ZoneData
        {
            public string id { get; set; }
            public string scope { get; set; }
        }
        protected override async System.Threading.Tasks.Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var processResult = new ProcessTagResult(context);
            
            var httpContext = context.HttpContext();
            var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
            var scopeString = arguments.GetValueOrDefault<string>("scope", null);
            if (string.IsNullOrEmpty(scopeString))
            {
                if (arguments.Count > 1 && arguments[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
                {
                    scopeString = (string) arguments[1].Value;
                }
                else
                {
                    scopeString = "page";
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


            if (!scopeString.Equals("page", StringComparison.OrdinalIgnoreCase))
            {
                scopeString = scopeString.ToLowerInvariant();
                if (scopeString != "template" && scopeString != "site")
                {
                    throw new Exception("invalid scope type " + scopeString);
                }
            }
             


            if (pageContext.CmsContext != null && !pageContext.CmsContext.Initialized)
            {
                var cmsHelper = context.Resolve<CmsHelper>();

                cmsHelper.InitCmsPageContext(pageContext, siteContext).Wait();
            }



            ZoneScope zoneScope;
            if (!Enum.TryParse(scopeString, true, out zoneScope))
            {
                zoneScope = ZoneScope.Page;
            }
             


            isEditmode = isEditmode && scopeString.EqualsIgnoreCase(pageContext.EditMode.GetValueOrDefault(EditModes.page).ToString());

            var zoneRuntimeData = 
                    (pageContext.CmsContext == null || pageContext.CmsContext.RuntimeData == null) ? 
                    null : 
                    pageContext.CmsContext.RuntimeData.FirstOrDefault(x => zoneScope == x.Scope && x.Id.EqualsIgnoreCase(zoneId));
            using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
            {
                var sb = sbItemDisposer.Item;
                sb.Append("<div id=\"mz-drop-zone-");
                sb.Append(zoneId);
                sb.Append("\" class=\"mz-drop-zone");
                if (isEditmode)
                {
                    sb.Append(" mz-cms-editing mz-cms-grid\" ");
                    sb.AppendJsonHtmlAttribute(new
                                               {
                                                   id = zoneId,
                                                   scope = scopeString,
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
                                widget.Config = widget.Config  as JObject ?? new JObject();
                                bool isContent = widget.DefinitionId == "content";
                                widget.isRichText = isContent;

                                WidgetDefinition widgetDefinition = null;
                                widgetDefinition = themeEntityDefinitionProvider.GetWidgetDefintion(widget.DefinitionId);
                                if (widgetDefinition == null)
                                {
                                    if (isEditmode)
                                    {
                                        sb.Append("<div class=\"mz-cms-block\" ");
                                        sb.AppendJsonHtmlAttribute(widget, "widget");
                                        sb.Append(">");
                                        sb.Append("<div class=\"mz-cms-content\"");
                                        sb.Append(">");
                                        sb.Append("<b> missing widget type id=[");
                                        sb.Append(widget.DefinitionId);
                                        sb.Append("]");

                                        sb.Append("</div>");
                                        sb.Append("</div>");

                                    }
                                    continue;
                                }



                                sb.Append("<div class=\"mz-cms-block\" ");

                                if (isEditmode)
                                {
                                    sb.AppendJsonHtmlAttribute(widget, "widget");
                                }

                                sb.Append(">");
                                sb.Append("<div class=\"mz-cms-content\"");

                                var widgetConfig = widget.Config;

                                var height = widgetConfig["height"] as JValue;
                                if (height != null && height.Value!= null )
                                {
                                    var heightStr = height.Value.ToString();
                                    if (!string.IsNullOrWhiteSpace(heightStr))
                                    {
                                        sb.Append(" style=\"height:");
                                        int heightInt;
                                        if (int.TryParse(heightStr, out heightInt))
                                        {
                                            sb.Append(heightInt);
                                            sb.Append("px;\"");
                                        }
                                        else
                                        {
                                            sb.Append(heightStr);
                                            sb.Append(";\"");
                                        }
                                    }
                                   
                                }

                                sb.Append(">");

                                if (isContent)
                                {

                                    sb.Append((string)widgetConfig["body"]);
                                }
                                else
                                {
                                    var pos = sb.Length;

                                    var sw1 = new StringWriter(sb);
                                    try
                                    {
                                        await context.AsyncRender("widgets/" + widgetDefinition.DisplayTemplate, widget, sw1).ConfigureAwait(false);

                                        sw1.Flush();
                                        //sb.Append(sw1.GetStringBuilder().ToString());

                                    }
                                    catch (Exception ex)
                                    {
                                        if (isEditmode)
                                        {
                                            sb.Remove(pos, sb.Length - pos);
                                            sb.Append(ex.ToString());
                                        }
                                    }
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
                return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
            }
        }


        private bool HasVisited(string zoneId, HttpContextBase httpContext)
        {

            if (httpContext == null || httpContext.Items == null)
            {
                return false;
            }
            var hs = (HashSet<string>) httpContext.Items[HTTPCONTEXTKEY];
            if (hs == null)
            {
                httpContext.Items[HTTPCONTEXTKEY] = hs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
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