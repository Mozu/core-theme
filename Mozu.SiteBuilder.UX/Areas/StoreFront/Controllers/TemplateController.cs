using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
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
using ProductOption = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOption;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class TemplatesController : BaseController
    {

        
        //private ILifetimeScope _lifetimeScope;
        private readonly IPageTypeProvider _pageTypeProvider;
       // private readonly IViewEngine _viewEngine;

        public TemplatesController(
            IPageTypeProvider pageTypeProvider 
            
            //IViewEngine viewEngine,
            //ILifetimeScope lifetimeScope 

            )
        {
            _pageTypeProvider = pageTypeProvider;
          //  _viewEngine = viewEngine;
           // _lifetimeScope = lifetimeScope;
        }





        public async Task<ActionResult> Index(string templateId)
        {
            this.SiteContext.EditMode = EditModes.Template ; 
            var pageType = _pageTypeProvider.GetPageTypes().FirstOrDefault( x => x.Id == templateId);
            if (pageType == null)
            {
                return new HttpNotFoundResult("template not found");
            }
            var pc = this.SiteContext.PageContext;

            pc.CmsContext = new CmsPageContext()
            {
                TemplateReq = new DocumentRequest()
                                  {
                                    Path = pageType.Template     ,
                                    Collection="templates"
                                  }
            };
            await this.AsyncInitData();
            return View(pageType.Template, GetModel(pageType));
        }

        object GetModel(PageTemplateDefinition template)
        {
            if (template.EntityType == null)
            {
                return new JObject();
            }
            switch (template.EntityType)
            {
                case "cart":
                    {
                        return new Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart()
                           {
                               Items = new List<CartItem>()
                           };
                    }
                case "product":
                    {
                        return new Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product()
                                   {
                                       Options = new List<ProductOption>(),
                                       ProductImages = new ProductImageCollection()
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
