using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;
using NDjango.FiltersCS.Compatibility;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using System.Threading.Tasks;
using Microsoft.FSharp.Core;
using System.Collections;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    public static class ExtensionMethods
    {
        public static StringBuilder AppendJson(this StringBuilder sb, object obj)
        {
            sb.Append(Newtonsoft.Json.JsonConvert.SerializeObject(obj, CaseInsensitiveJsonSerializerSettings.Default));
            return sb;
        }

        public static TItem EnsureInContext<TKey, TItem>(this HttpContextBase ctx, TKey key, Func<TItem> thing) where TItem :class
        {
            var guy = ctx.Items[key] as TItem;
            if (guy != null) return guy;

            guy = thing();
            ctx.Items[key] = guy;
            return guy;
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
    /// </summary>
    [Name("cms_resources")]
    public class EditResourcesTag : SimpleTagBase
    {
        static string FileVersion = System.Diagnostics.FileVersionInfo.GetVersionInfo(typeof(BaseApiController).Assembly.Location).FileVersion;
        const string CalienteScriptFormat = "\t\t<script type=\"text/javascript\" src=\"{0}/admin/scripts/chorizo/caliente/build/{1}.js?{2},{3}\"></script>\r\n";
        static AssemblyInformationalVersionAttribute  AssemblyInfoAtt = (System.Reflection.AssemblyInformationalVersionAttribute)(typeof(BaseApiController).Assembly.GetCustomAttributes(typeof(System.Reflection.AssemblyInformationalVersionAttribute), false).FirstOrDefault() ?? new System.Reflection.AssemblyInformationalVersionAttribute("local"));
        static string AssemblyInfoHash = new Guid(System.Security.Cryptography.MD5.Create().ComputeHash(System.Text.Encoding.ASCII.GetBytes(AssemblyInfoAtt.InformationalVersion))).ToString();



        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
           
            var pageContext = context.PageContext();
            var isEditmode = pageContext.IsEditMode;
            var siteContext = context.SiteContext();
            var settings = context.Resolve<ISettings>();
           

            if (!isEditmode)
            {
                using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
                {
                    return new[] { WalkResultHelpers.Buffer(string.Format("\t\t<link rel=\"stylesheet\" href=\"{0}/resources/cms/layout.css?{1},{2}\">\r", siteContext.CdnPrefix, FileVersion, AssemblyInfoHash)) };
                }
            }
            var tenantAdminSettings = context.Resolve<ITenantAdminSettingsContext>();

            if ( !tenantAdminSettings.EnableBetaAdmin && !string.IsNullOrEmpty(tenantAdminSettings.BetaControlVersion))
            {
                return new ControlTag().ProcessTag(arguments, context, getTemplateFunction, tenantAdminSettings);
            }

            var cdnHost = string.IsNullOrWhiteSpace(siteContext.GeneralSettings.CustomCdnHostName) ? settings.AppSettings("CdnHost") : siteContext.GeneralSettings.CustomCdnHostName;
            var cdn = settings.AppSettings("disableCDN") == "true" || string.IsNullOrEmpty(cdnHost)
                ? string.Empty
                : string.Format("//{0}/common", cdnHost);


            var layoutJavaScripts = new List<string>() { "chorizo" };
           
            

          
            using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
            {
                var sb = sbItemDisposer.Item;

                sb.AppendFormat("\t\t<link rel=\"stylesheet\" href=\"{0}/resources/cms/layout.css?{1},{2}\">\r", siteContext.CdnPrefix, FileVersion, AssemblyInfoHash);
                sb.AppendFormat("\r\n\t\t<link rel=\"stylesheet\" href=\"{2}/admin/scripts/chorizo/build/chorizo.css?{0},{1},\">", FileVersion, AssemblyInfoHash, cdn);
                sb.AppendLine("\t\t<link rel=\"stylesheet\" href=\"//netdna.bootstrapcdn.com/font-awesome/4.0.2/css/font-awesome.min.css\">");
                sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>");
#if DEBUG
                sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.js\"></script>");
#else
               
#endif

                layoutJavaScripts.Aggregate(sb, (builder, s) => builder.AppendFormat(CalienteScriptFormat, cdn, s, FileVersion, AssemblyInfoHash));

                return new[] { WalkResultHelpers.Buffer(sb.ToString()) }; 
            }
        }

        public class ControlTag
        {
            static string FileVersion = System.Diagnostics.FileVersionInfo.GetVersionInfo(typeof(BaseApiController).Assembly.Location).FileVersion;
            static string[] autoIncludeScripts = new[] { "_classfactory", "format", "content", "targets", "widgets", "editor" };
            static AssemblyInformationalVersionAttribute AssemblyInfoAtt = (System.Reflection.AssemblyInformationalVersionAttribute)(typeof(BaseApiController).Assembly.GetCustomAttributes(typeof(System.Reflection.AssemblyInformationalVersionAttribute), false).FirstOrDefault() ?? new System.Reflection.AssemblyInformationalVersionAttribute("local"));
            static string AssemblyInfoHash = new Guid(System.Security.Cryptography.MD5.Create().ComputeHash(System.Text.Encoding.ASCII.GetBytes(AssemblyInfoAtt.InformationalVersion))).ToString();



            public IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction, ITenantAdminSettingsContext tenantAdminSettingContext)
            {
                var siteContext = context.SiteContext();
               
                var settings = context.Resolve<ISettings>();
                var cdnHost = string.IsNullOrWhiteSpace(siteContext.GeneralSettings.CustomCdnHostName) ? settings.AppSettings("CdnHost") : siteContext.GeneralSettings.CustomCdnHostName;
                var cdn = settings.AppSettings("disableCDN") == "true" || string.IsNullOrEmpty(cdnHost)
                    ? string.Empty
                    : string.Format("//{0}/common", cdnHost);

                
                using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
                {
                    var sb = sbItemDisposer.Item;

                    sb.AppendFormat("\t\t<link rel=\"stylesheet\" href=\"{0}/resources/cms/layout.css?bcv={1}&{2},{3}\">\r", siteContext.CdnPrefix, tenantAdminSettingContext.BetaControlVersion, FileVersion, AssemblyInfoHash);
                    sb.AppendFormat("\r\n\t\t<link rel=\"stylesheet\" href=\"{3}/admin/scripts/chorizo/build/chorizo.css?bcv={0}&{1},{2},\">", tenantAdminSettingContext.BetaControlVersion, FileVersion, AssemblyInfoHash, cdn);
                    sb.AppendLine("\t\t<link rel=\"stylesheet\" href=\"//netdna.bootstrapcdn.com/font-awesome/4.0.2/css/font-awesome.min.css\">");
                    sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>");
#if DEBUG
                    sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.js\"></script>");
#else
                sb.AppendLine("\t\t<script src=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js\"></script>");
#endif
                    autoIncludeScripts.Aggregate(sb, (builder, s) => builder.AppendFormat("\t\t<script type=\"text/javascript\" src=\"{0}/admin/scripts/chorizo/{1}.js?bcv={2}&{3},{4}\"></script>\r\n", cdn, s, tenantAdminSettingContext.BetaControlVersion, FileVersion, AssemblyInfoHash));

                    return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
                }
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

    [Name("dropzone")]
    public class DropZoneTag : SimpleTagBaseAsync
    {
        public static object HTTPCONTEXTKEY = new object();

        public class ZoneData
        {
            public string id { get; set; }
            public string scope { get; set; }
        }
        protected override async Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var httpContext = context.HttpContext();
            var zoneId = arguments.GetValueOrDefault("zoneId", () => (string)arguments.First().Value);
            if (HasVisited(zoneId, httpContext))
            {
                throw new RenderingError(string.Format("Zone {0} already rendered", zoneId), null);
            }

            var siteContext = context.SiteContext();
            var pageContext = context.PageContext();
            var viewContext = context.ViewContext();
            var sbApiContext = context.SiteBuilderApiContext();
            var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
            ZoneScope scope = ParseZoneScopeString(arguments);
            var zoneSpan = arguments.GetValueOrDefault("span", 12);
                                                                   
            if (pageContext.CmsContext != null && !pageContext.CmsContext.Initialized)
            {
                var cmsHelper = context.Resolve<CmsHelper>();
                await cmsHelper.InitCmsPageContext(pageContext, siteContext, sbApiContext).ConfigureAwait(false);
            }

            var isEditmode = pageContext.IsEditMode && scope.ToStringQuickly().EqualsIgnoreCase(pageContext.EditMode.GetValueOrDefault(EditModes.page).ToString());

            var calienteRuntimeData = GetCalienteRuntimeData(scope, zoneId, pageContext);
            if (calienteRuntimeData != null)
            {
                var rendered = await WriteCalienteZoneRuntimeData(context, themeEntityDefinitionProvider.GetWidgetDefinition, scope, zoneSpan, zoneId, isEditmode, calienteRuntimeData).ConfigureAwait(false);
                return new[] { WalkResultHelpers.Buffer(rendered) };
            }
            else
            {
                var chorizoRuntimeData = GetRuntimeData(scope, zoneId, pageContext);
                var rendered = await WriteZoneRuntimeData(context, themeEntityDefinitionProvider.GetWidgetDefinition, scope, zoneSpan, zoneId, isEditmode, chorizoRuntimeData).ConfigureAwait(false);

                return new[] { WalkResultHelpers.Buffer(rendered) };
            }

        }

        private static async Task<string> WriteCalienteZoneRuntimeData(IContext context, Func<string, WidgetDefinition> getWidgetDefFunc, ZoneScope scope, int zoneSpan, string zoneId, bool isEditmode, Caliente.ZoneRuntimeData zoneRuntimeData)
        {
            using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
            {
                var sb = sbItemDisposer.Item;
                WriteCalienteOpenDropZoneTag(scope, zoneSpan, zoneId, isEditmode, zoneRuntimeData, sb);

                if (zoneRuntimeData != null && zoneRuntimeData.Rows != null)
                {
                    foreach (var row in zoneRuntimeData.Rows)
                    {
                        await buildCalienteRow(row, sb, scope, zoneSpan, zoneId, isEditmode, getWidgetDefFunc, context).ConfigureAwait(false);
                    }
                }
                WriteCloseDropZoneTag(sb);
                return sb.ToString();
            }
        }

        private static async Task buildCalienteRow(Caliente.ZoneRowRuntimeData row, StringBuilder sb, ZoneScope scope, int zoneSpan, string zoneId, bool isEditmode, Func<string, WidgetDefinition> getWidgetDefFunc, IContext context)
        {
            sb.Append("<div class=\"mz-cms-row\"");

            sb.AppendJsonHtmlAttribute(new
            {
                title = row.Title,
            }, "widget");

            sb.Append(">");

            if (row.Columns != null)
            {
                foreach (var column in row.Columns)
                {
                    if (column.Rows.SafeAny() && !column.Widgets.SafeAny())
                    {
                        sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\"  style=\"width:{2}\">", column.Span, zoneSpan, column.Width);
                        foreach (var childRow in column.Rows)
                        {
                            await buildCalienteRow(childRow, sb, scope, zoneSpan, zoneId, isEditmode, getWidgetDefFunc, context).ConfigureAwait(false);
                        }
                        sb.Append("</div>");

                    }
                    else if (column.Widgets.SafeAny() && !column.Rows.SafeAny())
                    {
                        await WriteCalienteWidgets(sb, context, getWidgetDefFunc, column.Width, column.Span, zoneSpan, isEditmode, column.Widgets).ConfigureAwait(false);
                    }
                    else if (!column.Widgets.SafeAny() && !column.Rows.SafeAny())
                    {
                        AddEmptyColumn(sb, column.Width, column.Span, zoneSpan);
                    }
                    else if (column.Widgets.SafeAny() && column.Rows.SafeAny())
                    {
                        throw new ArgumentException("a column cannot have both rows and widgets.");
                    }
                }
            }

            sb.Append("</div>");
        }

        private static void AddEmptyColumn(StringBuilder sb, string width, string columnSpan, int zoneSpan)
        {
            sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\"  style=\"width:{2}\">", columnSpan, zoneSpan, width);
            sb.Append("</div>");
        }

        private static async Task<string> WriteZoneRuntimeData(IContext context, Func<string, WidgetDefinition> getWidgetDefFunc, ZoneScope scope, int zoneSpan, string zoneId, bool isEditmode, Chorizo.ZoneRuntimeData zoneRuntimeData)
        {
            using (var sbItemDisposer = StringBuilderPool.Default.GetContainer())
            {
                var sb = sbItemDisposer.Item;
                WriteOpenDropZoneTag(scope, zoneSpan, zoneId, isEditmode, zoneRuntimeData, sb);

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
                            await WriteWidgets(sb, context, getWidgetDefFunc, column.Span, zoneSpan, isEditmode, column.Widgets).ConfigureAwait(false);
                        }
                        sb.Append("</div>");
                    }
                }
                WriteCloseDropZoneTag(sb);
                return sb.ToString();
            }
        }

        private static void WriteCloseDropZoneTag(StringBuilder sb)
        {
            sb.Append("</div>");
        }

        private static void WriteCalienteOpenDropZoneTag(ZoneScope scope, int zoneSpan, string zoneId, bool isEditmode, Caliente.ZoneRuntimeData zoneRuntimeData, StringBuilder sb)
        {
            sb.AppendFormat("<div id=\"mz-drop-zone-{0}", zoneId);
            sb.Append("\" class=\"mz-drop-zone");
            if (isEditmode)
            {
                sb.Append(" mz-cms-editing mz-cms-grid\" ");
                sb.AppendJsonHtmlAttribute(new
                {
                    id = zoneId,
                    scope = scope.ToStringQuickly(),
                    span = zoneSpan,
                    source = zoneRuntimeData == null ? null : zoneRuntimeData.Source
                }, "drop-zone");
            }
            else
            {
                sb.Append("\" ");
            }
            sb.Append(">");
        }

        private static void WriteOpenDropZoneTag(ZoneScope scope, int zoneSpan, string zoneId, bool isEditmode, Chorizo.ZoneRuntimeData zoneRuntimeData, StringBuilder sb)
        {
            sb.AppendFormat("<div id=\"mz-drop-zone-{0}", zoneId);
            sb.Append("\" class=\"mz-drop-zone");
            if (isEditmode)
            {
                sb.Append(" mz-cms-editing mz-cms-grid\" ");
                sb.AppendJsonHtmlAttribute(new
                {
                    id = zoneId,
                    scope = scope.ToStringQuickly(),
                    span = zoneSpan,
                    source = zoneRuntimeData == null ? null : zoneRuntimeData.Source
                }, "drop-zone");
            }
            else
            {
                sb.Append("\" ");
            }
            sb.Append(">");
        }

        private static async Task WriteWidgets(StringBuilder sb, IContext context, Func<string, WidgetDefinition> getWidgetDefFunc, int? columnSpan, int zoneSpan, bool isEditmode, IEnumerable<ZoneWidgetRuntimeData> widgets)
        {
            sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\">", columnSpan, zoneSpan);

            foreach (var widget in widgets)
            {
                await WriteWidget(sb, widget, getWidgetDefFunc, isEditmode, context).ConfigureAwait(false);
            }

            sb.Append("</div>");
        }

        private static async Task WriteCalienteWidgets(StringBuilder sb, IContext context, Func<string, WidgetDefinition> getWidgetDefFunc, string columnWidth, string columnSpan, int zoneSpan, bool isEditmode, IEnumerable<ZoneWidgetRuntimeData> widgets)
        {
            sb.AppendFormat("<div class=\"mz-cms-col-{0}-{1}\"  style=\"width:{2}\">", columnSpan, zoneSpan, columnWidth);

            foreach (var widget in widgets)
            {
                await WriteWidget(sb, widget, getWidgetDefFunc, isEditmode, context).ConfigureAwait(false);
            }

            sb.Append("</div>");
        }
                                                                                                    
        private static async Task WriteWidget(StringBuilder sb, ZoneWidgetRuntimeData widget, Func<string, WidgetDefinition> getWidgetDefFunc, bool isEditmode, IContext context)
        {
            {
                widget.Config = widget.Config as JObject ?? new JObject();
                bool isContent = widget.DefinitionId == "content";
                widget.isRichText = isContent;

                var widgetDefinition = getWidgetDefFunc(widget.DefinitionId);
                if (widgetDefinition == null)
                {
                    if (isEditmode)
                    {
                        sb.Append("<div class=\"mz-cms-block\" "); sb.AppendJsonHtmlAttribute(widget, "widget"); sb.Append(">");
                            sb.Append("<div class=\"mz-cms-content\" >");
                                sb.AppendFormat("<b> missing widget type id=[{0}] </b>", widget.DefinitionId);
                            sb.Append("</div>");
                        sb.Append("</div>");
                    }
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
                if (height != null && height.Value != null)
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
        }

        private static Chorizo.ZoneRuntimeData GetRuntimeData(ZoneScope scope, string zoneId, Mvc.Contexts.IPageContext pageContext)
        {
            return (pageContext.CmsContext == null || pageContext.CmsContext.RuntimeData == null) ?
                    null :
                    pageContext.CmsContext.RuntimeData.FirstOrDefault(x => scope == x.Scope && x.Id.EqualsIgnoreCase(zoneId));
        }

        private static Caliente.ZoneRuntimeData GetCalienteRuntimeData(ZoneScope scope, string zoneId, Mvc.Contexts.IPageContext pageContext)
        {
            return (pageContext.CmsContext == null || pageContext.CmsContext.CalienteRuntimeData == null) ?
                    null :
                    pageContext.CmsContext.CalienteRuntimeData.FirstOrDefault(x => scope == x.Scope && x.Id.EqualsIgnoreCase(zoneId));
        }

        private static string DetermineZoneScopeDefault(ArgumentCollection args)
        {
            if (args.Count > 1 && args[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
            {
                return (string)args[1].Value;
            }
            return "page";
        }

        private static ZoneScope ParseZoneScopeString(ArgumentCollection arguments)
        {
            var scopeString = arguments.GetValueOrDefault("scope", () => DetermineZoneScopeDefault(arguments));
            ZoneScope scope;
            if (Enum.TryParse(scopeString, true, out scope))
            {
                return scope;
            }
            return ZoneScope.Page;
        }

        private bool HasVisited(string zoneId, HttpContextBase httpContext)
        {
            if (httpContext == null || httpContext.Items == null) return false;
            var hs = httpContext.EnsureInContext(HTTPCONTEXTKEY, () => new HashSet<string>(StringComparer.OrdinalIgnoreCase));
            if (hs.Contains(zoneId)) return true;
            hs.Add(zoneId);
            return false;
        }
    }
    public static class ListExt
    {
        public static bool SafeAny<T>(this IEnumerable<T> items)
        {
            if (items == null) return false;
            return items.Any();
        }

        public static bool SafeAny<T>(this IEnumerable<T> items, Func<T, bool> pred)
        {
            if (items == null) return false;
            return items.Any(pred);
        }
    }
}