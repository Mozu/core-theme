using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
//

using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class HomeController : BaseApiController
    {
        // private INavigationRuntimeFactory _navigationRuntimeFactory;
        private readonly IWebToolsRepository _webToolsRepository;

        public HomeController(IWebToolsRepository webToolsRepository)
        {
            _webToolsRepository = webToolsRepository;
        }

        //
        // GET: /StoreFront/Home/
        [System.Web.Http.HttpGet  ]
        public async Task<ActionResult> Index()
        {
            var nav = SiteContext.Navigation;
            if ( nav != null && nav.Count() > 0)
            {
                var item = nav.FirstOrDefault(x => x.IsHomePage);
                if ( item != null  && item.Url.Length >0 && item.Url != "/pages/home")
                {
                    return new TransferResult(item.Url );
                }
            }


            SiteContext.PageContext.CmsContext= new CmsPageContext()
                                                    {
                                                        Initialized=false,
                                                        Template = new DocumentRequest()
                                                                          {
                                                                              Collection ="templates",
                                                                              Path="index"
                                                                          }
                                                    };
         
            
            return this.View("index");


        }

        [System.Web.Http.HttpGet]
        public async Task<ActionResult> NotFound()
        {

            SiteContext.PageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    Collection = "templates",
                    Path = "404"
                }
            };
        
            return this.View("404");
        }

        public async Task<ActionResult> GoogleSiteVerification(string hash)
        {
            var fileStream = await _webToolsRepository.GetWebMasterToolsFile(string.Format("google{0}.html", hash));

            return File(fileStream, "text/html");
        }

        public async Task<ActionResult> RobotsTxt()
        {
            var content = await _webToolsRepository.GetRobotsContent();

            return Content(content, "text/plain");
        }
    }
}
