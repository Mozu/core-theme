using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Mozu.Content.Contracts;
using Mozu.Core.Actions;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(ActionFilterConstants.GlobalPageBeforeAction,
        ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(ActionFilterConstants.GlobalPageAfterAction, ActionExtensionExecutionTypes.AfterController,
        Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class CmsPagesController : BaseApiController
    {
        private readonly ICustomRouteHandler _customRouteHandler;
        private readonly Lazy<UrlHelper> _urlhelper;

        public CmsPagesController(
            ICustomRouteHandler customRouteHandler, 
            Lazy<UrlHelper> urlhelper, 
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> expressionEvaluator)
        {
            _customRouteHandler = customRouteHandler;
            _urlhelper = urlhelper;
            PageRuleVisitor = pageRuleVisitor;
            ExpressionEvaluator = expressionEvaluator;
        }

        [HttpHead]
        [HttpGet]
        public async Task<IActionResult> ContentIndex(string documentListName, string listView = null)
        {
            var redirect = _customRouteHandler.RedirectWithContext(Request, FancyRoute.CmsList,
                () => new Dictionary<string, object> {{"listName", documentListName}, {"listView", listView}});

            if (redirect != null) return redirect;
            if (Request.Method == HttpMethod.Head.Method) return Ok();

            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x =>
                x.ListFQN == documentListName &&
                string.Equals(x.EntityType, "contentIndex", StringComparison.OrdinalIgnoreCase));
            var template = pageType != null ? pageType.Template : "document-list";

            PageContext.CmsContext = new CmsPageContext
            {
                Page = new DocumentRequest
                {
                    Path = documentListName + (!string.IsNullOrEmpty(listView) ? "-" + listView : "") + ".index",
                    ListFQN = "pages@mozu",
                    IncludeInactiveDocument = SiteContext.IsEditMode
                },
                Template = new DocumentRequest
                {
                    Path = template,
                    IncludeInactiveDocument = SiteContext.IsEditMode
                }
            };


            await ContextInitializationTasks;
            if (PageContext.CmsContext.Page.Document != null)
            {
                PageTypeDefinition pageDefinition = null;
                var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
                if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
                    pageDefinition = SiteContext.Theme.PageTypes.FirstOrDefault(x =>
                        string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                template = pageDefinition != null ? pageDefinition.Template : template;
            }

            PageContext.PageType = "documentList";
            PageContext.ListName = documentListName;
            PageContext.ListViewName = listView;

            await ContextInitializationTasks;
            var view = View(template, new {listFQN = documentListName});
            return Ok(view);
        }

        [HttpHead]
        [HttpGet]
        [SbActionExtensionFilter(ActionFilterConstants.CmsPageBeforeAction,
            ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(ActionFilterConstants.CmsPageAfterAction,
            ActionExtensionExecutionTypes.AfterController)]
        public async Task<IActionResult> Page(string documentListName, string documentName, string variationId = "")
        {
            PageContext.CmsContext = new CmsPageContext
            {
                Page = new DocumentRequest
                {
                    Path = documentName,
                    ListFQN = documentListName,
                    IncludeInactiveDocument = PageContext.IsEditMode
                }
            };

            if (!String.IsNullOrEmpty(variationId))
            {
                PageContext.VariationId = variationId;
            }

            await ContextInitializationTasks;

            if (PageContext.CmsContext.Page.Document == null)
                return NotFound("page not found");

            var redirect = _customRouteHandler.RedirectWithContext(Request, FancyRoute.CmsPage,
                () => ToRouteDictionary(PageContext.CmsContext.Page.Document));
            
            if (redirect != null) return redirect;

            if (Request.Method == HttpMethod.Head.Method) return Ok();

            var vm = PageContext.CmsContext.Page.Document;
        
            NavigationContext.SetContext(vm);

            PageContext.ListName = documentListName;
            PageContext.DocumentId = PageContext.CmsContext.Page.Document.Id;
            PageContext.Title = vm.Get<string>("title");
            PageContext.MetaDescription = vm.Get<string>("meta_description");
            PageContext.MetaTitle = vm.Get<string>("meta_title");
            PageContext.PageType = "web_page";

            if (!PageContext.IsEditMode)
            {
                if (PageContext.CmsContext.Page.Document.Get("hidden", false))
                    return NotFound(" not found");
                if (PageContext.CmsContext.Page.Document.TryGet("redirect_url", out string redir) &&
                   !string.IsNullOrEmpty(redir)) return new RedirectResult(redir);
            }

            PageTypeDefinition pageDefinition = null;
            var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
            if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
                pageDefinition = SiteContext.Theme.PageTypes.FirstOrDefault(x =>
                    string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
            if (pageDefinition == null)
            {
                pageDefinition = SiteContext.Theme.PageTypes.Where(x =>
                    !string.IsNullOrEmpty(x.Template)
                    &&
                    (!string.IsNullOrEmpty(x.DocumentTypeFQN) || !string.IsNullOrEmpty(x.ListFQN))
                    &&
                    (string.IsNullOrEmpty(x.DocumentTypeFQN) || string.Equals(x.DocumentTypeFQN, vm.DocumentTypeFQN,
                         StringComparison.OrdinalIgnoreCase))
                    &&
                    (string.IsNullOrEmpty(x.ListFQN) ||
                     string.Equals(x.ListFQN, vm.ListFQN, StringComparison.OrdinalIgnoreCase))
                ).OrderByDescending(
                    x => (string.IsNullOrEmpty(x.DocumentTypeFQN) ? 0 : 1) +
                         (string.IsNullOrEmpty(x.ListFQN) ? 0 : 2)).ToList().FirstOrDefault();
            }

            var template = pageDefinition != null ? pageDefinition.Template : "blank-page";

            if (PageContext.CmsContext.Template == null || PageContext.CmsContext.Template.Path != template)
                PageContext.CmsContext.Template = new DocumentRequest
                {
                    Path = template
                };
            if (((Request.HttpContext.GetRouteData().Routers.OfType<CustomRoute>().FirstOrDefault())?.IsCanonicalFor(FancyRoute.CmsPage))
                .GetValueOrDefault(false))
                PageContext.CrawlerInfo.CanonicalUrl = Request.HttpContext.GetRequestUri().AbsolutePath;
            else
                PageContext.CrawlerInfo.CanonicalUrl = _urlhelper.Value.MakeUrl(UrlHelper.UrlType.Document,
                    PageContext.CmsContext.Page.Document, null);
            
            var result = View(template, vm);
            return Ok(result);
        }

        private static IDictionary<string, object> ToRouteDictionary(Document doc)
        {
            return Mapper.Map<IDictionary<string, object>>(doc);
        }
    }
}