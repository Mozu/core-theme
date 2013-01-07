using Mozu.SiteBuilder.UX.Admin.Configuration;

namespace Mozu.SiteBuilder.UX.Admin
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {

        protected void Application_Start()
        {
            ApplicationBootstrapper.Bootstrap();
        }
    }
}