using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Autofac;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.Customers;
using NDjango.Interfaces;
using NDjango.Misc;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprView
    {
        private readonly string _mappedPath;
        private readonly string _virtualPath;
        // private readonly ITemplateManager _templateManager;


        public HyprView(string mappedPath, string virtualPath, ITemplateManager templateManager)
        {
            _mappedPath = mappedPath;
            _virtualPath = virtualPath;
            //     _templateManager = templateManager;
        }


        private Dictionary<string, object> CreateRequestContext(HyprViewContext viewContext, TextWriter writer)
        {
            var clientApiContext = viewContext.LifetimeScope.Resolve<ClientApiContext>();


            var navigationContext = viewContext.LifetimeScope.Resolve<NavigationContext>();

            var pageContext = viewContext.LifetimeScope.Resolve<PageContext>();
            var siteContext = viewContext.LifetimeScope.Resolve<SiteContext>();


            var requestContext = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

            foreach (var kvp in viewContext.ViewData)
            {
                requestContext[kvp.Key] = kvp.Value;
            }


            User user = pageContext.User;
            if (viewContext.HttpContext.Items["templateVariables"] == null)
            {
                viewContext.HttpContext.Items["templateVariables"] = new Hashtable(StringComparer.OrdinalIgnoreCase);
            }


            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"];
            requestContext["_vc"] = viewContext;

            requestContext["model"] = viewContext.ViewData.Model;
            if (viewContext.ParentActionViewContext != null)
            {
                requestContext["pageModel"] = viewContext.ParentActionViewContext.ViewData.Model;
            }
            else
            {
                requestContext["pageModel"] = viewContext.ViewData.Model;
            }


            requestContext["siteContext"] = siteContext;
            requestContext["themeSettings"] = siteContext.ThemeSettings;
            requestContext["labels"] = siteContext.Labels;
            requestContext["pageContext"] = pageContext;
            requestContext["navigation"] = navigationContext;
            requestContext["apiContext"] = clientApiContext;
            requestContext["user"] = user;
            requestContext["true"] = true;
            requestContext["false"] = false;
            requestContext["viewPath"] = _virtualPath;
            requestContext["ViewData"] = viewContext.ViewData;


            return requestContext;
        }

        public async Task<bool> AsyncRender(HyprViewContext viewContext, TextWriter writer)
        {
            Dictionary<string, object> requestContext = CreateRequestContext(viewContext, writer);
            try
            {
                var templateManager = viewContext.RequestMessage.Resolve<ITemplateManager>();
                ITemplate template = templateManager.GetTemplate(_mappedPath);
                var renderer = new TemplateRenderer(templateManager, template, requestContext);

                await renderer.AsyncRender(writer);
            }
            catch (Exception ex)
            {
                throw new RenderingError(string.Format("error in template [{0}]", _virtualPath), new FSharpOption<Exception>(ex));
            }
            await writer.FlushAsync();
            return true;
        }

        public void Render(HyprViewContext viewContext, TextWriter writer)
        {
            var templateManager = viewContext.RequestMessage.Resolve<ITemplateManager>();
            Dictionary<string, object> requestContext = CreateRequestContext(viewContext, writer);
            try
            {
                ITemplate template = templateManager.GetTemplate(_mappedPath);
                var renderer = new TemplateRenderer(templateManager, template, requestContext);

                renderer.Render(writer);
                //var reader = templateManager.RenderTemplate(_mappedPath, requestContext);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("error in template " + _virtualPath, ex);
            }
        }
    }
}