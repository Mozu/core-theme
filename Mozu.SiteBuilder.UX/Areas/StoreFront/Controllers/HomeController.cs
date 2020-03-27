using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.OAF;
using System;
using Microsoft.AspNetCore.Mvc;
using Mozu.Core.Configuration;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
     public class HomeController : BaseApiController
    {
        public HomeController() { }

        //
        //[SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
        //[SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
        [System.Web.Http.HttpGet]
        public IActionResult Index()
        {
            PageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "home"
                }
            };
            PageContext.PageType = string.IsNullOrEmpty(PageContext.PageType) ? "web_page" : PageContext.PageType;

            return View("home");
        }
        
      
        [System.Web.Http.HttpGet]
        public new IActionResult NotFound()
        {
            return NotFound("Page not found.");
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
        public IActionResult SeoProcessor(string url = null)
        {
            return Ok();
        }

        [System.Web.Http.HttpGet]
        public async Task<IActionResult> GoogleSiteVerification(string hash)
        {
            var webToolsRepository = LifetimeScope.Resolve<IWebToolsRepository>();
            var resp = await webToolsRepository.GetWebMasterToolsFile($"google{hash}.html");
            if (!resp.ResponseMessage.IsSuccessStatusCode) return NotFound();
            var stream = await resp.ResponseMessage.Content.ReadAsStreamAsync();
            return File(stream, "text/html");

        }
        [System.Web.Http.HttpGet]
        public async Task<IActionResult> RobotsTxt()
        {
            var webToolsRepository = LifetimeScope.Resolve<IWebToolsRepository>();
            var content = await webToolsRepository.GetRobotsContent();

            return Ok(content);
        }
    }
}
