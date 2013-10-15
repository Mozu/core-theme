using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Autofac;
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

            var siteBuilderApiContext = viewContext.LifetimeScope.Resolve<ISiteBuilderApiContext >();
            var siteBuilderContext = viewContext.LifetimeScope.Resolve<ISiteBuilderContext>();
            var requestContext = new Dictionary<string, object>(viewContext.ViewData);
            //  var authenticationHelper = new AuthenticationHelper(viewContext.HttpContext, provider: new CookieProvider(viewContext.HttpContext,Core.Settings.MozuConfigurationManager.Settings),  cookieName:null);
            // var gcu = authenticationHelper.GetCurrentUser();
            // var profile = authenticationHelper.GetCurrentProfileToken();

            var user = siteBuilderContext.User;

            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"] = (System.Collections.Hashtable)viewContext.HttpContext.Items["templateVariables"] ?? new System.Collections.Hashtable(StringComparer.OrdinalIgnoreCase);
         //   requestContext["Html"] = requestContext["html"] = html = new HtmlHelper(new ViewContext() { HttpContext = viewContext .HttpContext }, new ViewDataContainer() { ViewData = viewContext.ViewData });
            requestContext["_vc"] = viewContext;
            requestContext["_tw"] = writer;

           
            requestContext["Model"] = requestContext["model"] = viewContext.ViewData.Model;
            if (viewContext.ParentActionViewContext != null)
            {
                requestContext["PageModel"] = requestContext["pageModel"] = viewContext.ParentActionViewContext.ViewData.Model;
            }
         
            //requestContext["Templates"] = new TemplateLocator(html, this.TemplateManager);
            requestContext["SiteContext"] = requestContext["siteContext"] = siteBuilderContext;
            requestContext["ThemeSettings"] = requestContext["themeSettings"] = ( siteBuilderContext.ThemeSettings ?? new ThemeRuntimeSettingsCollection()).AsDictionary();
            requestContext["PageContext"] = requestContext["pageContext"] = siteBuilderContext.PageContext;
            requestContext["User"] = requestContext["user"] = user;
            requestContext["true"] = true;
            requestContext["false"] = false;
            requestContext["viewPath"] = _virtualPath;
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
                throw new InvalidOperationException("error in template " + this._virtualPath, ex);
            }
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