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
    [NDjango.Interfaces.Name("dropzone")]
    public class DropZoneTag : SimpleTagBase
    {
        public static object HTTPCONTEXTKEY = new object();

        //protected override Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        //{
        //    var httpContext = context.HttpContext();
        //    var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
        //    var scope = arguments.GetValueOrDefault<string>("scope", "page");
        //    var zoneId = arguments.GetValueOrDefault<string>("zoneId") ?? (string)arguments.First().Value;
        //    var htmlAttributes = arguments.GetValueOrDefault<IDictionary<string, object>>("htmlAttributes");
        //    var siteBuilderContext = context.SiteBuilderContext();
        //    var isEditmode = siteBuilderContext.IsEditMode;
        //    var viewContext = context.ViewContext();

        //    if (HasVisited(zoneId, httpContext ))
        //    {
        //        throw new RenderingError("Zone " + zoneId + "already rendered", null);
        //    }


        //    if (!scope.Equals("page", StringComparison.OrdinalIgnoreCase))
        //    {
        //        scope = scope.ToLowerInvariant();
        //        if (scope != "template" && scope != "site")
        //        {
        //            throw new Exception("invalid scope type " + scope);
        //        }
        //    }
        //    scope = scope.ToLowerInvariant();
        //    bool useDefaultId = true;
        //    var sb = new StringBuilder();
        //    sb.Append("<div ");
        //    sb.Append("\r\n1111111111 ");
        //    if (htmlAttributes != null)
        //    {
        //        foreach (var att in htmlAttributes)
        //        {
        //            if (att.Key.ToLower() == "id")
        //            {
        //                useDefaultId = false;
        //            }
        //            sb.Append(att.Key);
        //            sb.Append("=\"");
        //            sb.Append(HttpUtility.HtmlAttributeEncode(att.Value.ToString()));
        //            sb.Append("\" ");
        //        }
        //    }
        //    if (useDefaultId)
        //    {
        //        sb.Append("id=\"dropzone-");
        //        sb.Append(zoneId);
        //        sb.Append("\" ");
        //    }

        //    StringWriter sw;
        //    if (isEditmode && string.Equals(scope, siteBuilderContext.EditMode.GetValueOrDefault(EditModes.Page).ToString(), StringComparison.InvariantCultureIgnoreCase))
        //    {
        //        var jobj = new JsonObject();
        //        var dJ = jobj.AsDynamic();
        //        dJ["zoneId"] = zoneId;
        //        dJ["zoneScope"] = scope;
        //        sb.AppendFormat("data-editing-zone-scope=\"{0}\" ", scope ?? "page");
        //        sb.Append("data-editing-zone=\"");
        //        sw = new StringWriter();
        //        jobj.Save(sw, JsonSaveOptions.None);
        //        var json = sw.GetStringBuilder().ToString();
        //        sw = new StringWriter(sb);
        //        HttpUtility.HtmlAttributeEncode(json, sw);
        //        sb.Append("\"");
        //    }
        //    else
        //    {
        //        sw = new StringWriter(sb);
        //    }
        //    sb.Append(">");
        //    sb.AppendLine();

        //    string buffer = sb.ToString();
        //    sb.Clear();
        //    var walkerParent = walker.parent;
        //    walker = new Walker(walkerParent, walker.nodes, walker.buffer + buffer, walker.bufferIndex, context);

        //    walker = tagNode.Walk(templateManager, walker);





          

        //    if (siteBuilderContext.PageContext != null &&
        //        siteBuilderContext.PageContext.CmsContext != null &&
        //        siteBuilderContext.PageContext.CmsContext.RuntimeData != null)
        //    {


        //        var zoneWidgets = siteBuilderContext.PageContext.CmsContext.RuntimeData.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).OrderBy(x => x.Index).ToList();

        //        //StringBuilder sb = new StringBuilder();
        //        // var tw = new StringWriter();
        //        foreach (var zw in zoneWidgets)
        //        {
        //            if (zw.Definition == null)
        //            {
        //                zw.Definition = themeEntityDefinitionProvider.GetWidgetDefintion(zw.DefinitionId);
        //            }
        //            if (zw.Definition == null)
        //            {
        //                continue;
        //            }

        //            var template = templateManager.GetTemplate("widgets/" + zw.Definition.DisplayTemplate);

        //            if (template != null)
        //            {
        //                var widgetViewContext = new HyprViewContext(viewContext.ControllerContext, new ViewDataDictionary()
        //                                                                                               {
        //                                                                                                   Model = zw
        //                                                                                               }, viewContext);

        //                var widgetNdjangoContext = context.remove("Model").add(new Tuple<string, object>("Model", zw));
        //               // var index = walker.bufferIndex > walker.buffer.Length ? walker.bufferIndex : walker.buffer.Length;
        //                var widetWalker = new Walker(new FSharpOption<Walker>(walker), template.Nodes, "", 0 , context);
        //                tagNode.Walk(templateManager, widetWalker);

        //            }
        //            else
        //            {
        //                buffer = "<!-- widgettemplate[" + zw.Definition.DisplayTemplate + " not found -->";
        //                walker = new Walker(walkerParent, walker.nodes, walker.buffer + buffer, walker.bufferIndex, context);
        //                walker = tagNode.Walk(templateManager, walker);
        //            }


        //        } 

        //    }
             

        //    buffer = "</div>" +"\r\n2222222222 ";
    
        //    return walker;
        //}
        class food: INodeImpl
        {
            public string Buffer { get; set; }
            public NDjango.Lexer.Token Token
            {
                get { throw new NotImplementedException(); }
            }

            public Walker walk(ITemplateManager manager, Walker walker)
            {
                return new Walker(walker.parent, walker.nodes, walker.buffer + Buffer, walker.bufferIndex, walker.context );
            }
        }
        //class BlaTemplate: ITemplate
        //{
        //    public string Buffer { get; set; }


        //    FSharpList<INodeImpl> ITemplate.Nodes
        //    {
        //        get
        //        {
                  
        //            throw new NotImplementedException();
        //        }
        //    }

        //    TextReader ITemplate.Walk(ITemplateManager templateManager, IDictionary<string, object> dictionary)
        //    {
                
        //        return new StringReader(Buffer);
        //    }

        //    class hINodeImpl:INodeImpl
        //    {

        //        NDjango.Lexer.Token INodeImpl.Token
        //        {
        //            get { throw new NotImplementedException(); }
        //        }

        //        Walker INodeImpl.walk(ITemplateManager manager, Walker walker)
        //        {
        //            throw new NotImplementedException();
        //        }
        //    }
        //}
        //class bla : IContext
        //{
        //    public string Buffer { get; set; }
        //    public bool Autoescape
        //    {
        //        get { throw new NotImplementedException(); }
        //    }

        //    public FSharpOption<Type> ModelType
        //    {
        //        get { throw new NotImplementedException(); }
        //    }

        //    public string Translate(string value)
        //    {
        //        throw new NotImplementedException();
        //    }

        //    public IContext WithAutoescape(bool value)
        //    {
        //        throw new NotImplementedException();
        //    }

        //    public IContext WithModelType(Type value)
        //    {
        //        throw new NotImplementedException();
        //    }

        //    public IContext add(Tuple<string, object> value)
        //    {
        //        throw new NotImplementedException();
        //    }

        //    public IContext remove(string value)
        //    {
        //        throw new NotImplementedException();
        //    }

        //    public FSharpOption<object> tryfind(string value)
        //    {
        //        return new FSharpOption<object>(Buffer);
        //    }
        //}
       

        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var httpContext = context.HttpContext();
            var themeEntityDefinitionProvider = context.Resolve<IThemeEntityDefinitionProvider>();
            var scope = arguments.GetValueOrDefault<string>("scope", "page");
            var zoneId = arguments.GetValueOrDefault<string>("zoneId") ?? (string)arguments.First().Value;
            var htmlAttributes = arguments.GetValueOrDefault<IDictionary<string, object>>("htmlAttributes");
            var siteBuilderContext = context.SiteBuilderContext();
            var isEditmode = siteBuilderContext.IsEditMode;
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
            sb.Append("\r\n1111111111 ");
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
            if (isEditmode && string.Equals(scope, siteBuilderContext.EditMode.GetValueOrDefault(EditModes.Page).ToString(), StringComparison.InvariantCultureIgnoreCase))
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

           







            if (siteBuilderContext.PageContext != null &&
                siteBuilderContext.PageContext.CmsContext != null &&
                siteBuilderContext.PageContext.CmsContext.RuntimeData != null)
            {


                var zoneWidgets = siteBuilderContext.PageContext.CmsContext.RuntimeData.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).OrderBy(x => x.Index).ToList();

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