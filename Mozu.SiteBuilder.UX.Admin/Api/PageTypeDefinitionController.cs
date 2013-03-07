using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
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

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class PageTypeDefinitionController : BaseController
    {
         //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;
        IDocumentWebApiClient _docRepo;
        ICmsServiceWrapper _cmsService;
        //ISessionDocumentStore _sessionDocStore;
        private IPageTypeProvider _pageTypeProvider;

        public PageTypeDefinitionController(
            IDocumentWebApiClient docRepo,
            IApiContext apiContext,
            IProvisioningHelper provHelper,
            ICmsTypeHelper cmsTypeHelper,
            ICmsServiceWrapper cmsService, IPageTypeProvider pageTypeProvider)
        {
            _docRepo = docRepo;
            _cmsService = cmsService;
            _pageTypeProvider = pageTypeProvider;
            _cmsTypeHelper = cmsTypeHelper;
        
        }



        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<PageTemplateDefinition>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {


            IEnumerable<PageTemplateDefinition> pageTypes = _pageTypeProvider.GetPageTypes();
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