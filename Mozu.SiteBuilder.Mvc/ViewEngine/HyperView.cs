using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Autofac;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Themes;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprView
    {
     
        private readonly string _mappedPath;
        private readonly string _virtualPath;
       // private readonly ITemplateManager _templateManager;
       

        public HyprView(string mappedPath, string virtualPath , ITemplateManager templateManager)
        {
      
            _mappedPath = mappedPath;
            _virtualPath = virtualPath;
       //     _templateManager = templateManager;
          
        }
    


      

        Dictionary<string, object> CreateRequestContext(HyprViewContext viewContext, System.IO.TextWriter writer)
        {

            var clientApiContext = viewContext.LifetimeScope.Resolve<ClientApiContext>();


            var navigationContext = viewContext.LifetimeScope.Resolve<NavigationContext>();

            var pageContext = viewContext.LifetimeScope.Resolve<PageContext>();
            var siteContext = viewContext.LifetimeScope.Resolve<SiteContext>();
            





            var siteBuilderContext = viewContext.LifetimeScope.Resolve<ISiteBuilderContext>();
            var requestContext = new Dictionary<string, object>(viewContext.ViewData, StringComparer.OrdinalIgnoreCase );


            var user = pageContext.User;
            if (viewContext.HttpContext.Items["templateVariables"] == null)
            {
                viewContext.HttpContext.Items["templateVariables"] = new System.Collections.Hashtable(StringComparer.OrdinalIgnoreCase);
            }

            
            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"];
            requestContext["_vc"] = viewContext;
         
            requestContext["Model"] =  viewContext.ViewData.Model;
            if (viewContext.ParentActionViewContext != null)
            {
                requestContext["PageModel"] = viewContext.ParentActionViewContext.ViewData.Model;
            }
            else
            {
                requestContext["PageModel"] = viewContext.ViewData.Model;
            }


            requestContext["SiteContext"] = siteContext;
            requestContext["ThemeSettings"] =  siteContext.ThemeSettings;
            requestContext["PageContext"] =  pageContext;
            requestContext["navigationContext"] = navigationContext;
            requestContext["clientApiContext"] = clientApiContext;
            requestContext["User"] =  user;
            requestContext["true"] = true;
            requestContext["false"] = false;
            requestContext["viewPath"] = _virtualPath;
            requestContext["ViewData"] = viewContext.ViewData;

         
            return requestContext;
        }
        public async Task<bool> AsyncRender(HyprViewContext viewContext, System.IO.TextWriter writer)
        {
            var requestContext = CreateRequestContext(viewContext, writer);
            try
            {
                var templateManager = viewContext.RequestMessage.Resolve<ITemplateManager>();
                var reader = templateManager.RenderTemplate(_mappedPath, requestContext);
                var buffer = new char[4096];
                int count = 0;

                while ((count = (await reader.ReadAsync(buffer, 0, buffer.Length))) > 0)
                {
                    writer.Write(buffer, 0, count);
                }
            }
            catch (Exception ex)
            {
                throw new NDjango.Interfaces.RenderingError(  string.Format( "error in template [{0}]" ,this._virtualPath) , new FSharpOption<Exception>(ex));
            }
            await writer.FlushAsync();
            return true;
        }
        public void Render(HyprViewContext viewContext, System.IO.TextWriter writer)
        {


            var templateManager = viewContext.RequestMessage.Resolve<ITemplateManager>();
            var requestContext = CreateRequestContext(viewContext, writer);
            try
            {

                var reader = templateManager.RenderTemplate(_mappedPath, requestContext);
                var buffer = new char[4096];
                int count = 0;
                
                while ((count = reader.Read(buffer, 0, buffer.Length)) > 0)
                {
                    writer.Write(buffer, 0, count);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("error in template " + this._virtualPath, ex);
            }
        }

    }
}