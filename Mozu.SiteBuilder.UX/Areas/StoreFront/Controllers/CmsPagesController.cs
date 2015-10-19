using Autofac;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
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
using Mozu.SiteBuilder.Mvc.OAF;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
    public class CmsPagesController : BaseApiController
    {

        protected IDocumentListWebApiClient _docRepo;
        protected IDocumentTypeWebApiClient _docTypeRepo;
        protected ICmsServiceWrapper _cmsService;
        readonly HyprViewEngine _hyprViewEngine;
        readonly ICustomRouteHandler _customRouteHandler;


        public CmsPagesController(
            IDocumentListWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            ICmsServiceWrapper cmsService,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            HyprViewEngine hyprViewEngine,
            ICustomRouteHandler customRouteHandler)
        {
            _docRepo = docRepo.CloneWithoutUserClaims();
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            _hyprViewEngine = hyprViewEngine;
            _customRouteHandler = customRouteHandler;
        }

        [HttpHead]
        [HttpGet]
        public async Task<HttpResponseMessage> ContentIndex(string documentListName, string listView = null)
        {
            var redirect = await _customRouteHandler.RedirectWithContext(Request, FancyRoute.CmsList, () => new Dictionary<string, object> { { "listName", documentListName }, { "listView", listView } });

            if (redirect != null)
            {
                return redirect;
            }
            if (Request.Method == HttpMethod.Head)
            {
                return this.Request.CreateResponse(HttpStatusCode.OK);
            }

            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x => x.ListFQN == documentListName && string.Equals(x.EntityType, "contentIndex", StringComparison.OrdinalIgnoreCase));
            var template = pageType != null ? pageType.Template : "document-list";




            this.PageContext.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest()
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


            await Task.WhenAll(this.ContextInitializationTasks);
            if (this.PageContext.CmsContext.Page.Document != null)
            {
                PageTypeDefinition pageDefinition = null;
                var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
                if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
                {
                    pageDefinition = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                }
                template = pageDefinition != null ? pageDefinition.Template : template;
            }

            this.PageContext.PageType = "documentList";
            this.PageContext.ListName = documentListName;
            this.PageContext.ListViewName = listView;

            await Task.WhenAll(this.ContextInitializationTasks);
            var view = View(template, new { listFQN = documentListName });
            return this.Request.CreateResponse(HttpStatusCode.OK, view);
        }




        IDictionary<string, object> ToRouteDictionary(Mozu.Content.Contracts.Document doc)
        {
            return AutoMapper.Mapper.Map<IDictionary<string, object>>(doc);
        }


        [HttpHead]
        [HttpGet]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CmsPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CmsPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        public async Task<HttpResponseMessage> Page(string documentListName, string documentName)
        {



            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest()
                {
                    Path = documentName,
                    ListFQN = documentListName,
                    IncludeInactiveDocument = PageContext.IsEditMode
                }
            };


            await Task.WhenAll(this.ContextInitializationTasks);

            if (pc.CmsContext.Page.Document == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "page not found");
            }

            var redirect = await _customRouteHandler.RedirectWithContext(Request, FancyRoute.CmsPage, () => ToRouteDictionary(pc.CmsContext.Page.Document)).ConfigureAwait(false);
            if (redirect != null)
            {
                return redirect;
            }
            if (Request.Method == HttpMethod.Head)
            {
                return this.Request.CreateResponse(HttpStatusCode.OK);
            }

            var vm = pc.CmsContext.Page.Document;

            NavigationContext.SetContext(vm);

            pc.ListName = documentListName;
            pc.DocumentId = pc.CmsContext.Page.Document.Id;
            pc.Title = vm.Get<string>("title") as string;
            pc.MetaDescription = vm.Get<string>("meta_description") as string;
            pc.MetaTitle = vm.Get<string>("meta_title") as string;
            pc.PageType = "web_page";

            if (!this.PageContext.IsEditMode)
            {
                if (pc.CmsContext.Page.Document.Get<bool>("hidden", false))
                {
                    return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, " not found");
                }
                string redir;
                if (pc.CmsContext.Page.Document.TryGet<string>("redirect_url", out redir) && !string.IsNullOrEmpty(redir))
                {
                    return this.Request.CreateResponse(HttpStatusCode.OK, this.Redirect(redir));
                }
            }

            PageTypeDefinition pageDefinition = null;
            var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
            if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
            {
                pageDefinition = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
            }
            if (pageDefinition == null)
            {
                pageDefinition = this.SiteContext.Theme.PageTypes.Where(x =>
                    !string.IsNullOrEmpty(x.Template)
                    &&
                    (!string.IsNullOrEmpty(x.DocumentTypeFQN) || !string.IsNullOrEmpty(x.ListFQN))
                    &&
                    (string.IsNullOrEmpty(x.DocumentTypeFQN) || string.Equals(x.DocumentTypeFQN, vm.DocumentTypeFQN, StringComparison.OrdinalIgnoreCase))
                    &&
                    (string.IsNullOrEmpty(x.ListFQN) || string.Equals(x.ListFQN, vm.ListFQN, StringComparison.OrdinalIgnoreCase))
                    ).OrderByDescending(
                        x =>
                        {
                            return ((string.IsNullOrEmpty(x.DocumentTypeFQN) ? 0 : 1)) + ((string.IsNullOrEmpty(x.ListFQN) ? 0 : 2));
                        }
                    ).ToList().FirstOrDefault();
                ;
            }
            var template = pageDefinition != null ? pageDefinition.Template : "blank-page";


            if (PageContext.CmsContext.Template == null || PageContext.CmsContext.Template.Path != template)
            {
                this.PageContext.CmsContext.Template = new DocumentRequest()
                {
                    Path = template
                };


            }



            var result = View(template, vm);


            return this.Request.CreateResponse(HttpStatusCode.OK, result);

        }
    }
}
