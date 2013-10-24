using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;

using Autofac;

using Mozu.ProductRuntime.Contracts;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
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
using ProductImage = Mozu.ProductRuntime.Contracts.ProductImage;
using ProductOption = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOption;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    
    public class TemplatesController : BaseApiController
    {
        private readonly ISiteBuilderContext _siteBuilderContext;


        //private ILifetimeScope _lifetimeScope;
       // private readonly IPageTypeProvider _pageTypeProvider;
       // private readonly IViewEngine _viewEngine;

        public TemplatesController(
            ISiteBuilderContext siteBuilderContext 
            
           

            )
        {
            _siteBuilderContext = siteBuilderContext;

            //  _viewEngine = viewEngine;
           // _lifetimeScope = lifetimeScope;
        }


        public async Task<HttpResponseMessage> Index(string templateId)
        {
            this.PageContext.EditMode = EditModes.Template ;
            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x => x.Id == templateId);
            if (pageType == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");
                
            }
            var pc = PageContext;

            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                                  {
                                    Path = pageType.Template     ,
                                    Collection="templates"
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
            switch (template.EntityType)
            {
                case "cart":
                    {
                        //return new Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart()
                        //   {
                        //       Items = new List<CartItem>()
                        //   };
                        throw new NotImplementedException();
                        // TODO: replace with new cart viewmodel
                    }
                case "product":
                    {
                        return new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product()
                                   {
                                       Options = new List<ProductRuntime.Contracts.ProductOption>(),
                                       Content = new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductContent()
                                                     {
                                                         ProductImages = new ProductImageCollection()
                                                     }
                                   };
                    }
                default:
                    {
                        return new JObject();
                    }
            }
        }

     

    }
}
