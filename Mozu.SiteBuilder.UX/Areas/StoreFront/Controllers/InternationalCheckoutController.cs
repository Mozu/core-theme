using Autofac;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
     public class InternationalCheckoutController : BaseApiController
    {
        public InternationalCheckoutController() { }

        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Index()
        {
            PageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "international-checkout"
                }
            };
            PageContext.PageType = string.IsNullOrEmpty(PageContext.PageType) ? "web_page" : PageContext.PageType;

            return this.View("international-checkout");
        }
    }
}
