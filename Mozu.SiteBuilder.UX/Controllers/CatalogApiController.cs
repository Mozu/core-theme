using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

using AutoMapper;
using Mozu.Core;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.UX.Controllers
{

    [InitCmsPageContext]
    [InitSettingsAttribute]
    public class APICatalogController : BaseApiController
    {

        private readonly IProductRuntimeWebApiClient _productClient;

        public APICatalogController(IProductRuntimeWebApiClient productClient, Autofac.ILifetimeScope lifetimeScope)
        {
            _productClient = productClient;

        }

        [System.Web.Http.HttpGet()]
        public async Task<ViewResult> ProductDetails(string productcode)
        {

            var res = await _productClient.GetProduct(productcode, null, "Categories,Properties,Options", SbApiContext.DataViewMode == DataViewModeType.Pending);

        

            var prod = res.ReadAsSync();
            var product = Mapper.Map<Models.StoreFront.Catalog.Product>(prod);

            //SetCatalogContext(product);

            PageContext.PageType = "product";
            PageContext.ProductCode = productcode;


            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "product"
                },
                Page = new DocumentRequest()
                {
                    Path = "product_" + productcode,
                    Collection = "catalog_pages"
                }

            };






            return View("product", prod);



        }
    }
}
