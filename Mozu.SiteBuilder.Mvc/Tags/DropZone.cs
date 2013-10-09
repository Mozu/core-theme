//// -----------------------------------------------------------------------
//// <copyright file="DropZone.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//using System.Json;
//using Mozu.SiteBuilder.UX.Models;

//namespace Mozu.SiteBuilder.Mvc.Tags
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;

//    using System.Web;
//    using System.IO;
  
//    using Mozu.SiteBuilder.Mvc.Models.CMS;

//    [NDjango.Interfaces.Name("html_action")]
//    public class HT:SimpleTagBase
//    {

        
//        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
//        {
//            templateName = null;
//            buffer = "html_action depricated";
//        }
//    }


//    [NDjango.Interfaces.Name("dropzone2")]
//    public class DropZoneTag : DynamicTagBase
//    {
//        public static object HTTPCONTEXTKEY = new object();
//        public MvcHtmlString Process(string zoneId)
//        {
//            return Process(zoneId, null, null );
//        }
//        public MvcHtmlString Process(string zoneId, string scope)
//        {
//            return Process(zoneId, scope, null);
//        }

//        //public MvcHtmlString Process(object zoneId, object scope)
//        //{
//        //    return Process(zoneId.ToString(), (scope ?? "page").ToString(), null);
//        //}

//        public MvcHtmlString Process(string zoneId, IDictionary<string, object> htmlAttributes)
//        {
//            return Process(zoneId, null, htmlAttributes);
//        }
//        bool HasVisited(string zoneId)
//        {
            
//            if (HttpContext.Current == null || HttpContext.Current.Items == null)
//            {
//                return false;
//            }
//            var hs = (HashSet<string>)HttpContext.Current.Items[HTTPCONTEXTKEY];
//            if (hs == null)
//            {
//                HttpContext.Current.Items[HTTPCONTEXTKEY] = hs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
//            }
//            if (hs.Contains(zoneId))
//            {
//                return true;
//            }
//            else
//            {
//                hs.Add(zoneId);
//                return false;
//            }
            
//        }
//        public MvcHtmlString Process(string zoneId, string scope, IDictionary<string, object> htmlAttributes )
//        {
//            if (HasVisited(zoneId))
//            {
//                return new MvcHtmlString("!<-- warning:  redundant drop zone tag " + zoneId + " -->");
//            }
//            if (string.IsNullOrEmpty(scope) )
//            {
//                scope = "page";
//            }
//            else if ( !scope.Equals("page", StringComparison.OrdinalIgnoreCase))
//            {
//                scope = scope.ToLowerInvariant();
//                if (scope != "template" && scope != "site")
//                {
//                    throw new Exception("invalid scope type "  + scope  );
//                }
//            }
//            scope = (scope ?? "page").ToLowerInvariant();
//            bool useDefaultId = true;
//            StringBuilder sb = new StringBuilder();
//            sb.Append("<div ");
//            if (htmlAttributes != null)
//            {
//                foreach (var att in htmlAttributes)
//                {
//                    if (att.Key.ToLower() == "id")
//                    {
//                        useDefaultId = false;
//                    }
//                    sb.Append(att.Key);
//                    sb.Append("=\"");
//                    sb.Append(HttpUtility.HtmlAttributeEncode(att.Value.ToString ()));
//                    sb.Append("\" ");
//                }
//            }
//            if (useDefaultId)
//            {
//                sb.Append("id=\"dropzone-");
//                sb.Append(zoneId);
//                sb.Append("\" ");
//            }
//            var isEditmode = SiteBuilderContext.Current.IsEditMode;
//            StringWriter sw;
//            if (isEditmode && string.Equals(scope, SiteBuilderContext.Current.EditMode.GetValueOrDefault(EditModes.Page).ToString(), StringComparison.InvariantCultureIgnoreCase  ))
//            {
//                var jobj = new JsonObject();
//                var dJ = jobj.AsDynamic();
//                dJ["zoneId"] = zoneId;
//                dJ["zoneScope"] = scope;
//                sb.AppendFormat("data-editing-zone-scope=\"{0}\" ", scope ?? "page");
//                sb.Append("data-editing-zone=\"");
//                sw = new StringWriter();
//                jobj.Save(sw, JsonSaveOptions.None);
//                var json = sw.GetStringBuilder().ToString();
//                sw = new StringWriter(sb);
//                HttpUtility.HtmlAttributeEncode(json, sw);
//                sb.Append("\"");
//            }
//            else
//            {
//                sw = new StringWriter(sb);
//            }
//            sb.Append (">");
//            sb.AppendLine();
//           // var mvcString = this.Html.Action("Zone", "Widgets",   new {zoneId= zoneId,    area = "storefront" });






//           // sw.Write(mvcString.ToString());

//            sw.Write("DROPZONE TBD");
//            sw.Write("</div>");
//            return new MvcHtmlString(sw.GetStringBuilder().ToString());
            
//        }

//        //public ActionResult Zone(List<string> widgetQuery, string zoneId)
//        //{
//        //    if (HasVisitedZone(zoneId))
//        //    {
//        //        return new ContentResult()
//        //        {
//        //            Content = "<!--sof " + zoneId + "-->"
//        //        };
//        //    }
//        //    if (SiteContext.PageContext == null || SiteContext.PageContext.CmsContext == null || SiteContext.PageContext.CmsContext.RuntimeData == null)
//        //    {
//        //        return new ContentResult()
//        //        {
//        //            Content = ""
//        //        };
//        //    }
//        //    var zoneWidgets = SiteContext.PageContext.CmsContext.RuntimeData.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).OrderBy(x => x.Index).ToList();

//        //    StringBuilder sb = new StringBuilder();
//        //    var tw = new StringWriter();
//        //    foreach (var zw in zoneWidgets)
//        //    {
//        //        if (zw.Definition == null)
//        //        {
//        //            zw.Definition = _themeEntityDefinitionProvider.GetWidgetDefintion(zw.DefinitionId);
//        //        }
//        //        if (zw.Definition == null)
//        //        {
//        //            continue;
//        //        }
//        //        var viewRes = _viewEngine.FindPartialView(this.ControllerContext, zw.Definition.DisplayTemplate, true);
//        //        if (viewRes.View != null)
//        //        {
//        //            var vc = new ViewContext(this.ControllerContext, viewRes.View, new ViewDataDictionary(), this.TempData, tw);
//        //            vc.ViewData.Model = zw;
//        //            viewRes.View.Render(vc, tw);
//        //        }

//        //    }
//        //    return new ContentResult()
//        //    {
//        //        Content = tw.GetStringBuilder().ToString()
//        //    };

//        //}
//    }

    
//}
