using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
//
using Autofac;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    public class HomeController : BaseApiController
    {
        // private INavigationRuntimeFactory _navigationRuntimeFactory;


        public HomeController()
        {

        }

        //
        // GET: /StoreFront/Home/
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Index()
        {
            var nav = NavigationContext.Tree;
            if (nav != null && nav.Count() > 0)
            {
                var item = nav.FirstOrDefault(x => x.IsHomePage);
                if (item != null && item.Url.Length > 0 && item.Url != "/pages/home")
                {
                    return new TransferResult(item.Url);
                }
            }


            PageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "home"
                }
            };


            return this.View("home");


        }

        [System.Web.Http.HttpGet]
        public HttpResponseMessage NotFound()
        {
            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Page not found.");
            //PageContext.CmsContext = new CmsPageContext()
            //{
            //    Initialized = false,
            //    Template = new DocumentRequest()
            //    {
            //        ListFQN = "pageTemplateContent@mozu",
            //        Path = "404"
            //    }
            //};



            //return this.View("404");
        }
        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> SeoProcessor(string url = null)
        {
            return this.Request.CreateResponse();
        }

        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> GoogleSiteVerification(string hash)
        {
            var webToolsRepository = LifetimeScope.Resolve<IWebToolsRepository>();
            var resp = await webToolsRepository.GetWebMasterToolsFile(string.Format("google{0}.html", hash));
            if (resp.ResponseMessage.IsSuccessStatusCode)
            {
                var stream = await resp.ResponseMessage.Content.ReadAsStreamAsync();
                return this.Request.CreateResponse(HttpStatusCode.OK, File(stream, "text/html"));
            }

            return this.NotFound();

        }
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> RobotsTxt()
        {
            var webToolsRepository = LifetimeScope.Resolve<IWebToolsRepository>();
            var content = await webToolsRepository.GetRobotsContent();

            return Content(content, "text/plain");
        }
    }
}
