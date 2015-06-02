using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Autofac;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Contexts;
using NDjango.Interfaces;
using NDjango.Misc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprView
    {
        private readonly string _mappedPath;
        private readonly string _virtualPath;
        
        public HyprView(string mappedPath, string virtualPath)
        {
            _mappedPath = mappedPath;
            _virtualPath = virtualPath;
        }
        
        private static Dictionary<string, object> CreateRequestContext(HyprViewContext viewContext, string virtualPath)
        {
            var clientApiContext = viewContext.LifetimeScope.Resolve<ClientApiContext>();
            var navigationContext = viewContext.LifetimeScope.Resolve<NavigationContext>();
            var pageContext = viewContext.LifetimeScope.Resolve<PageContext>();
            var siteContext = viewContext.LifetimeScope.Resolve<SiteContext>();
            var requestContext = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

            AddConstants(requestContext);
            AddViewPath(requestContext, virtualPath);
            AddViewContextData(requestContext, viewContext);
            AddPageContextData(requestContext, pageContext);
            AddSiteContextData(requestContext, siteContext);
            AddNavigationContextData(requestContext, navigationContext);
            AddClientApiContextData(requestContext, clientApiContext);
            
            return requestContext;
        }

        private static void AddViewPath(Dictionary<string, object> requestContext, string virtualPath)
        {
            requestContext["viewPath"] = virtualPath;
        }

        private static void AddConstants(Dictionary<string, object> requestContext)
        {
            requestContext["true"] = true;
            requestContext["false"] = false;
            requestContext["now"] = DateTime.UtcNow;
        }

        private static void AddClientApiContextData(Dictionary<string, object> requestContext, ClientApiContext clientApiContext)
        {
            requestContext["apiContext"] = clientApiContext;
        }

        private static void AddNavigationContextData(Dictionary<string, object> requestContext, NavigationContext navigationContext)
        {
            requestContext["navigation"] = navigationContext;
        }

        private static void AddSiteContextData(Dictionary<string, object> requestContext, SiteContext siteContext)
        {
            requestContext["siteContext"] = siteContext;
            requestContext["themeSettings"] = siteContext.ThemeSettings;
            requestContext["labels"] = siteContext.Labels;
        }

        private static void AddPageContextData(Dictionary<string, object> requestContext, PageContext pageContext)
        {
            requestContext["pageContext"] = pageContext;
            requestContext["user"] = pageContext.User;
        }

        private static void AddViewContextData(Dictionary<string, object> requestContext, HyprViewContext viewContext)
        {
            viewContext.HttpContext.Items["templateVariables"] = viewContext.HttpContext.Items["templateVariables"] ?? new Hashtable(StringComparer.OrdinalIgnoreCase);

            foreach (var kvp in viewContext.ViewData)
            {
                requestContext[kvp.Key] = kvp.Value;
            }

            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"];
            requestContext["_vc"] = viewContext;
            requestContext["model"] = requestContext["pageModel"] = viewContext.ViewData.Model;
            
            if (viewContext.ParentActionViewContext != null)
            {
                requestContext["pageModel"] = viewContext.ParentActionViewContext.ViewData.Model;
            }

            requestContext["ViewData"] = viewContext.ViewData;
        }

        public async Task<bool> AsyncRender(HyprViewContext viewContext, TextWriter writer)
        {
            var requestContext = CreateRequestContext(viewContext, _virtualPath);
            var templateManager = viewContext.RequestMessage.Resolve<ITemplateManager>();
            try
            {
                var template = templateManager.GetTemplate(_mappedPath);
                var renderer = new TemplateRenderer(templateManager, template, requestContext);
                await renderer.AsyncRender(writer).ConfigureAwait(false);
            }
            catch (AggregateException aex)
            {
                // awaited methods wrap single exceptions in aggregates, so you have to unwrap them
                if (aex.InnerExceptions.Count != 1) throw MakeRenderingException(_virtualPath, aex);

                if (aex.InnerException is SyntaxException || aex.InnerException is RenderingException)
                {
                    throw aex.InnerException;
                }
                throw MakeRenderingException(_virtualPath, aex.InnerException);
            }
            catch (SyntaxException) { throw; }
            catch (RenderingException) { throw; }
            catch (Exception ex)
            {
                throw MakeRenderingException(_virtualPath, ex);
            }
            await writer.FlushAsync().ConfigureAwait(false);
            return true;
        }

        private static RenderingError MakeRenderingException(string path, Exception ex)
        {
            return new RenderingError(string.Format("error in template [{0}]", path), new FSharpOption<Exception>(ex));
        }
    }
}