using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Autofac;

using Mozu.ProductRuntime.Contracts;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteBuilder.UX.Models.StoreFront.Commerce;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Collections;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using CartItem = Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem;
using ProductImage = Mozu.ProductRuntime.Contracts.ProductImage;
using ProductOption = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOption;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [InitCmsPageContextActionFilter]
    public class TemplatesController : BaseApiController
    {
        


        //private ILifetimeScope _lifetimeScope;
       // private readonly IPageTypeProvider _pageTypeProvider;
       // private readonly IViewEngine _viewEngine;

        public TemplatesController(
            
           

            )
        {
            

            //  _viewEngine = viewEngine;
           // _lifetimeScope = lifetimeScope;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> Index(string templateId)
        {
            this.PageContext.EditMode = EditModes.template ;
            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x => x.Id == templateId);
            if (pageType == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");
                
            }
            var pc = PageContext;
            pc.PageType = pageType.EntityType;

            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                                  {
                                    Path = pageType.Template     ,
                                    Collection="templates",
                                    DocumentType = "page_template"
                                  }
            };

            return this.Request.CreateResponse(HttpStatusCode.OK, View(pageType.Template, GetModel(pageType)));
        }

        object GetModel(PageTypeDefinition template)
        {

            if (template.EntityType == null)
            {
                return new JObject();
            }
            var product = new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product()
                                   {
                                       Options = new List<ProductRuntime.Contracts.ProductOption>(),
                                       ProductCode = "test",
                                       Properties  = new List<ProductProperty>(),
                                       Content = new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductContent()
                                                     {
                                                         ProductName ="test",
                                                         ProductFullDescription = "test Full Description",
                                                         ProductShortDescription = "test Short Description",
                                                         ProductImages = new ProductImageCollection()
                                                     },

                                   };
            ;
            switch (template.EntityType)
            {
                case "cart":
                    {
                        return new Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart()
                                   {
                                       Items = new List<CartItem>()
                                                   {
                                                       new CartItem()
                                                           {
                                                               DiscountTotal = 50,
                                                               Product = new Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Product()
                                                                             {
                                                                                 ProductCode = product.ProductCode,
                                                                                 Name = product.ProductName

                                                                             }
                                                           }
                                                   },
                                       Total = 100,
                                       Id = "123",

                                   };
                    }
                case "product":
                    {
                        return product;
                    }
                default:
                    {
                        return new JObject();
                    }
            }
        }

     

    }
}
