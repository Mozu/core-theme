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
using Microsoft.Extensions.Caching.Memory;
using Mozu.Core.Api.Client;
using Mozu.Core.Configuration;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    public class HomeController : BaseApiController
    {
        public const string CrawlDelayConfigKey = "sitebuilder-crawl-delay";
        const string CrawlDelayTemplate = "\nCrawl-delay: {0}";
        const string CrawDelayRobotsKey = "Crawl-delay";
        private readonly ISettings _settings;
        private readonly IWebToolsRepository _webToolsRepository;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IMemoryCache _memoryCache;

        public HomeController(ISettings settings,
            IWebToolsRepository webToolsRepository,
            ITenantsWebApiClient tenantsWebApiClient,
            IMemoryCache memoryCache)
        {
            _settings = settings;
            _webToolsRepository = webToolsRepository;
            _tenantsWebApiClient = tenantsWebApiClient;
            _memoryCache = memoryCache;
        }



        [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction,
            executionType: ActionExtensionExecutionTypes.BeforeController,
            Priority = ActionFilterConstants.GlobalPageBeforePriority)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction,
            executionType: ActionExtensionExecutionTypes.AfterController,
            Priority = ActionFilterConstants.GlobalPageAfterPriority)]
        [HttpGet]
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


        [HttpGet]
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

        [HttpGet]
        public IActionResult SeoProcessor(string url = null)
        {
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GoogleSiteVerification(string hash)
        {
            var resp = await _webToolsRepository.GetWebMasterToolsFile($"google{hash}.html");
            if (!resp.ResponseMessage.IsSuccessStatusCode) return NotFound();
            var stream = await resp.ResponseMessage.Content.ReadAsStreamAsync();
            return File(stream, "text/html");

        }

        [HttpGet]
        public async Task<IActionResult> RobotsTxt()
        {
            var content = await _webToolsRepository.GetRobotsContent();
            var crawlDelay =
                await GetCrawlDelay(this.SbApiContext.TenantId, _settings, _tenantsWebApiClient, _memoryCache);
            content = AppendCrawlDelay(crawlDelay, content);
            return Ok(content);
        }

        public static async Task<int> GetCrawlDelay(
            int tenantId,
            ISettings settings,
            ITenantsWebApiClient tenantsWebApiClient,
            IMemoryCache memoryCache)
        {
            string key = "home-controller-craw-delay" + tenantId;
            var crawlDelay = memoryCache.Get<int?>(key);
            if (crawlDelay.HasValue)
            {
                return (int)crawlDelay;
            }

            var tenant = (await  tenantsWebApiClient.CloneWithoutUserClaims().GetTenantInternal(tenantId)).ReadAsSync();
            var att = tenant?.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase(CrawlDelayConfigKey));
            if (att != null)
            {
                crawlDelay = Convert.ToInt32(att.Value);
            }

            crawlDelay ??= settings.AppSettingsAsNullableInt(CrawlDelayConfigKey).GetValueOrDefault(5);

            memoryCache.Set(key, crawlDelay, TimeSpan.FromMinutes(5));
            return crawlDelay.GetValueOrDefault(-1);


        }

        public static string AppendCrawlDelay(int crawlDelay, string content)
        {
            if (crawlDelay <= 0)
            {
                return content;
            }
            if (content.IndexOf(CrawDelayRobotsKey, StringComparison.OrdinalIgnoreCase) == -1)
            {
                content += string.Format(CrawlDelayTemplate, crawlDelay);
            }

            return content;
        }
    }
}
