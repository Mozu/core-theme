using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
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



        [WebGet(UriTemplate = "/list")]
        public Response<List<PageCreateType>> List(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var singlePageTypes = new string[] { "homepage" };

            var filter = string.Join(" or ", singlePageTypes.Select(x => string.Format("page_type eq {0}", x)));
            var pageReq = new CmsListRequest ()
            { 
                Collection = CmsConstants.Documents.default_collection_name
            };
            pageReq.Filters.Add ("Properties.page_type eq homepage");

            var pageTask = _cmsService.GetList(pageReq);

            var blogReq  = new CmsListRequest()
            {
                Collection = "blogs",
                DocumentType = "blog"
            };
            var blogTask = _cmsService.GetList(blogReq);

            Task.WaitAll(pageTask, blogTask);
            var blogs = blogTask.Result.ReadAsSync();
            var pages = pageTask.Result.ReadAsSync();

            var copy = new List<PageTypeDefinition>(_pageTypeProvider.GetPageTypes());

            foreach (var singlePageType in singlePageTypes)
            {
                if (pages.Items.Any(x => (string)x.Get(CmsConstants.Widgets.page_type) == singlePageType))
                {
                    copy.RemoveAll(x => x.DefaultValues != null && (string)x.DefaultValues.GetValue(CmsConstants.Widgets.page_type) == singlePageType);
                }
            }

            if (blogs.Items.Any(x => x.DocumentType == "blog"))
            {
                copy.RemoveAll(x => x.EntityType == "blog");
            }
            else
            {
                copy.RemoveAll(x => x.EntityType == "post");
            }

            copy.RemoveAll(x => !x.UserCreatable.GetValueOrDefault(true));

            var pageTypes = copy.Select(x => new PageCreateType
            {
                DisplayName = x.DisplayName,
                Icon = x.Icon,
                Id = x.Id
            }).ToList();

            return List(pageTypes);
        }
    }
}