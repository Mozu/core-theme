using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Configuration;
using System.Web.Routing;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using System.Web;
using System;

namespace Mozu.SiteBuilder.UX
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {

        public override void Init()
        {
            ApplicationBootstrapper.Bootstrap();
        }
        protected void Application_BeginRequest (object sender, System.EventArgs e )
        {

           
        }
        protected void Application_EndRequest()
        {
            if (Context.Response.StatusCode == 404)
            {
                if ( Context.Request.RawUrl.IndexOf ("favicon" , StringComparison.OrdinalIgnoreCase )>-1)
                {
                    return ;
                }
                if (System.IO.Path.GetExtension(Context.Request.Path).Length > 0)
                {
                    return;
                }
                if ( Context.Request.RawUrl.IndexOf ( "404") > -1 )
                {
                    return ;
                }

                Context.Response.RedirectToRoute ("StoreFront_404");
            }
        }
    }
}