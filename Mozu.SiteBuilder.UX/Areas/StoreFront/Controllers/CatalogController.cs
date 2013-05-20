using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Controllers;
using System.Runtime.Serialization;

using System.Web.Routing;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient ;
using Mozu.SiteBuilder.Mvc;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class CatalogController : BaseController
    {
        IProductWebApiClient   _productClient;
        ISiteBuilderContext _ctx;
        public CatalogController(ISiteBuilderContext ctx , IProductWebApiClient productClient)
        {
            _ctx = ctx;
            _productClient = productClient;

            var options = ((ServiceClientBase) productClient).Options ??
                          (((ServiceClientBase) productClient).Options = new ConfigOptions());
            options.MaxSize = int.MaxValue;
        }

        public async Task<ActionResult> ProductDetail(string productCode)
        {
            var res = await _productClient.GetProduct(productCode, null, "Categories,Properties", _ctx.IsEditMode);
        
            if ( !res.ResponseMessage.IsSuccessStatusCode )
            {
                if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    return new HttpNotFoundResult();
                }
               
            }
            var prod = res.ReadAsAsync().Result;
            var product = Mapper.Map<Models.StoreFront.Catalog.Product>(prod);

            SetCatalogContext(product);

            SiteContext.PageContext.PageType = "product";
            SiteContext.PageContext.ProductCode = productCode;


            SiteContext.PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "product"
                }

            };


            await this.AsyncInitData();

            //SiteContext.PageContext.WidgetCreationTags.Add ("product-" + productCode);
            //SiteContext.PageContext.WidgetQuery.Add ("product");


            return View("product", prod);
        }

        public ActionResult ProductListing(int? categoryId= null , string sortBy = null, int? page = null, int? itemsPerPage = null,  List<object> productCodes = null)
        {
            categoryId = categoryId.GetValueOrDefault(-1) <1  ? null : categoryId;
            itemsPerPage = itemsPerPage.GetValueOrDefault(15);
            page = page.GetValueOrDefault(1);
            int startIdx = (page.Value - 1) * itemsPerPage.Value;
            var recurse = categoryId.HasValue ;
            string filter = null;
            if (productCodes != null && productCodes.Count > 0)
            {
                var productCodes2 = productCodes.Select(x => x.ToString()).Where( x=> !string.IsNullOrWhiteSpace(x)).Select(x => string.Format("productCode eq {0}", x)).ToList();
                if (productCodes2.Count > 0)
                {
                    filter = string.Join(" or ", productCodes2);
                }
                
                itemsPerPage = productCodes.Count;
             
            }


            var pcDC = _productClient.GetProducts(categoryId: categoryId, filter :filter , startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, recurse: recurse, responseGroups: "Categories,Measurements,Properties,Options,Extras").Result.ReadAsSync();

            var pc = Mapper.Map<ProductCollection>(pcDC);
           
            //`
            //pc.Paging.CurrentSort = sortBy;
            //pc.Paging.StartIndex = startIdx;
            //pc.Paging.UrlBase = "?";



            return PartialView(pc);
        }

        public ActionResult Store ()
        {
            var catList = _ctx.CatalogContext.AllCategories;
            var cat = new Category()
            {
                Content = new CategoryContent (){Name = "Store"}
               
            };
            this.SiteContext.PageContext.PageType = "category";
            SiteContext.PageContext.CategoryId = "-1";
            cat.ChildrenCategories = catList.Where(x => x.ParentCategory == null).ToList();
            return View("Category", cat);
        }

   


        public async Task<ActionResult> Category(int? categoryId = null, string sortBy = null, int? page = null, int? itemsPerPage = null )
        {
            _ctx.PageContext.PageType = "category";
            _ctx.PageContext.CategoryId = categoryId.ToString();
            var catList = _ctx.CatalogContext.AllCategories;



            var cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault (-1)).FirstOrDefault();
            //SiteContext.PageContext.WidgetCreationTags.Add("category-" + categoryId );
            //SiteContext.PageContext.WidgetQuery.Add("category");

            if (cat == null)
            {
               return new HttpNotFoundResult();
                 
            }

            SiteContext.PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "category"
                },
                Page = new DocumentRequest()
                           {
                               Path ="category-"+ categoryId ,
                               Collection = "catalog_pages"
                           }

            };
          
            ;

            SetCatalogContext(cat);

            await this.AsyncInitData(); 
            return View(cat);
          
            //.Result.ReadAsSync();
            //AutoMapper.Mapper.Map< Category>( cat );
            //return View();
        }


       

        public ActionResult FeaturedProducts(System.Collections.IList productCodes)
        {
            if (productCodes == null || productCodes.Count == 0)
            {
                return new  EmptyResult();
            }

            var productCodes2 = productCodes.Cast<object>().Select(x => string.Format("productCode eq {0}", x.ToString()));



            var filter = string.Join(" or ", productCodes2);

            var products =_productClient.GetProducts ( filter , null, null, 0, int.MaxValue, null, null)
                .Result.ReadAsSync ().Items
                .Select ( x=> AutoMapper.Mapper.Map <Product>( x))
                .ToList ();

            return PartialView( products);
        }

        /// <summary>
        /// Updates the SiteContext.CatalogContext with the current product.
        /// </summary>
        private void SetCatalogContext(Product product)
        {
            _ctx.CatalogContext.CurrentProduct = product;
            _ctx.Navigation.SetContext(product);
        }

        private void SetCatalogContext(Category category)
        {
            _ctx.Navigation.SetContext(category);
        }
       
    }
}
