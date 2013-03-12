using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Controllers;
using System.Runtime.Serialization;

using System.Web.Routing;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models;
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
        IProductCategoryRuntimeWebApiClient _catClient;
        IProductWebApiClient   _productClient;
        ISiteBuilderContext _ctx;
        public CatalogController(IProductCategoryRuntimeWebApiClient catClient , ISiteBuilderContext ctx , IProductWebApiClient productClient)
        {
            _ctx = ctx;
            _catClient = catClient;
            _productClient = productClient;

            var options = ((ServiceClientBase) productClient).Options ??
                          (((ServiceClientBase) productClient).Options = new ConfigOptions());
            options.MaxSize = int.MaxValue;
        }

        public ActionResult ProductDetail(string productCode)
        {
            var res = _productClient.GetProduct(productCode, null, null, _ctx.IsEditMode).Result;
            if ( !res.ResponseMessage.IsSuccessStatusCode )
            {
                var x = res.ReadException().UnwrapAgg();
                var errorCollection = x.Data["DataContract"] as ErrorCollection;
                var apiWCE = x as Mozu.Core.Api.Client.Exceptions.ApiWebClientException;
                if ( apiWCE!= null && apiWCE.RemoteError != null  && apiWCE.RemoteError.ExceptionDetail != null && apiWCE.RemoteError.ExceptionDetail.InnerExceptionDetail  != null )
                {
                    //todo: get a valid error code
                    if (apiWCE.RemoteError.ExceptionDetail.InnerExceptionDetail.Message.Contains("no valid variations"))
                    {
                        return new ContentResult()
                                   {
                                       Content = "<h1>This product has no valid Configurations</h1><p>go to the product editor and <b>activate</b> a configuration under the <B>Configurable Options</b> section"
                                   };
                    }
                    throw new ApplicationException(apiWCE.RemoteError.ExceptionDetail.InnerExceptionDetail.Message);
                }
                throw x;
            }
            var prod = res.ReadAsAsync().Result;
            var product = Mapper.Map<Models.StoreFront.Catalog.Product>(prod);
            SiteContext.PageContext.PageType = "product";
            SiteContext.PageContext.ProductCode = productCode;

            //SiteContext.PageContext.WidgetCreationTags.Add ("product-" + productCode);
            //SiteContext.PageContext.WidgetQuery.Add ("product");


            return View("product", prod);
        }

        public ActionResult ProductListing(int? categoryId, string sortBy = null, int? page = null, int? itemsPerPage = null)
        {
            itemsPerPage = itemsPerPage.GetValueOrDefault(15);
            page = page.GetValueOrDefault(1);
            int startIdx = (page.Value - 1) * itemsPerPage.Value;
            
            var pcDC = _productClient.GetProducts(null, categoryId > -1 ? (int?)categoryId : null, categoryId > -1 ? (bool?)true : null, startIdx, itemsPerPage.Value, sortBy, null)
                 .Result.ReadAsSync();
            var pc = Mapper.Map<ProductCollection>(pcDC);
           

            pc.Paging.CurrentSort = sortBy;
            pc.Paging.StartIndex = startIdx;
            pc.Paging.UrlBase = "?";



            return PartialView(pc);
        }

        public ActionResult Store ()
        {
            var catList = _ctx.CatalogContext.AllCategories;
            var cat = new Category()
            {
                Name = "Store Root",
                CategoryId = -1
            };
            this.SiteContext.PageContext.PageType = "category";
            SiteContext.PageContext.CategoryId = "0";
            cat.ChildrenCategories = catList.Where(x => x.ParentCategoryId== null  ).ToList();
            return View("Category", cat);
        }

        public JsonDCResult Configure(ProductConfigurationRequest req)
        {

            var pc = Mapper.Map<Mozu.ProductRuntime.Contracts.ProductSelections>(req);



            var res = _productClient.ConfiguredProduct(pc, req.ProductCode, true).Result.ReadAsSync();




            var ret = Mapper.Map<ConfiguredProduct>(res);
            foreach (var vmItem in req.Options.Where(x => !string.IsNullOrEmpty(x.ShopperEnteredValue)))
            {
                var item = ret.Options.SelectMany(x => x.Values).Where(x => x.Id == vmItem.Id).FirstOrDefault();
                if (item != null)
                {
                    item.StringValue = new AttributeValueString() {Value = (string) vmItem.ShopperEnteredValue};
                }
            }


            return new JsonDCResult()
                       {
                           JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                           Data = ret
                       };

        }


        public ActionResult Category(int? categoryId = null, string sortBy = null, int? page = null, int? itemsPerPage = null)
        {
            _ctx.PageContext.PageType = "category";
            _ctx.PageContext.CategoryId = categoryId.ToString();
            var catList = _ctx.CatalogContext.AllCategories;


            var cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault (-1)).FirstOrDefault();
            //SiteContext.PageContext.WidgetCreationTags.Add("category-" + categoryId );
            //SiteContext.PageContext.WidgetQuery.Add("category");

            if (cat == null)
            {
                return Redirect("/store");
            }
            cat.ChildrenCategories = catList.Where (x => x.ParentCategoryId.GetValueOrDefault (-1) == categoryId).ToList();

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

        
        //public class ProductListingViewData 
        //{
        //    public string ViewName
        //    {
        //        get;
        //        set;
        //    }
        //    public int? Count
        //    {
        //        get;
        //        set;
        //    }
        //    public RouteValueDictionary OriginalValues
        //    {
        //        get;
        //        set;
        //    }
        //}
        

       
    }
}
