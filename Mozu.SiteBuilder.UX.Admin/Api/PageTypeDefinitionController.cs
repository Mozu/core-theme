using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.ServiceModel.Web;
using System.ServiceModel;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Pages;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.Core;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/pagetypedefinition", SuppressDescriptorGeneration = true)]
    public class PageTypeDefinitionController : BaseController
    {
         //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentListWebApiClient _docRepo;
        //ICmsTypeHelper _cmsTypeHelper;
        IDocumentListWebApiClient _docRepo;
        ICmsServiceWrapper _cmsService;
        private readonly SiteContext _siteContext;
        
        //ISessionDocumentStore _sessionDocStore;
       // private IPageTypeProvider _pageTypeProvider;

        public PageTypeDefinitionController(
            IDocumentListWebApiClient docRepo,
            IApiContext apiContext,
            //ICmsTypeHelper cmsTypeHelper,
            ICmsServiceWrapper cmsService ,
            SiteContext siteContext)//, IPageTypeProvider pageTypeProvider)
        {
            _docRepo = docRepo;
            _cmsService = cmsService;
            _siteContext = siteContext;

            //   _pageTypeProvider = pageTypeProvider;
            //_cmsTypeHelper = cmsTypeHelper;
        
        }



        [HttpGetRoute(UriTemplate = "list")]
        public Response<List<PageTypeDefinition>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {


            IEnumerable<PageTypeDefinition> pageTypes = _siteContext.Theme.PageTypes.Concat(_siteContext.Theme.EmailTemplates).Concat(_siteContext.Theme.BackOfficeTemplates).ToList().Concat(_siteContext.Theme.MobileNotificationTemplates).ToList();
            bool userCreatable = false;
            if (extFilter.TryGetValue("userCreatable",out userCreatable ))
            {
                pageTypes = pageTypes.Where(x =>
                x.UserCreatable.GetValueOrDefault(true) == userCreatable );
            }

            //var pageCreateTypes = pageTypes.ToList();

           


            return List2(pageTypes.ToList() );
        }
    }
}