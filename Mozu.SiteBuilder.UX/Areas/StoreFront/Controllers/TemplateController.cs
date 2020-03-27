using Mozu.ProductRuntime.Contracts;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CartItem = Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    public class TemplatesController : BaseApiController
    {
        private readonly HyprViewEngine _hyprViewEngine;

        public TemplatesController(HyprViewEngine hyprViewEngine)
        {
            _hyprViewEngine = hyprViewEngine;
        }

        [System.Web.Http.HttpGet]
        public IActionResult Index(string templateId)
        {
           
            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x => x.Id == templateId);
            if (pageType == null)
            {
                return NotFound("not found");
            }

            var view = View(pageType.Template, GetModel(pageType));


            var pc = PageContext;
            pc.PageType = pageType.EntityType;

            pc.CmsContext = new CmsPageContext();


           
            if (pageType.EntityType == "siteTemplate")
            {
                this.PageContext.EditMode = EditModes.site ;
                pc.CmsContext.SiteTemplate  = new DocumentRequest()
                                         {
                                             Path = "site/" + pageType.Template,
                                             ListFQN = "pageTemplateContent@mozu",
                                             DocumentTypeFQN = "pageTemplateContent@mozu"
                                         };
                view.View = _hyprViewEngine.FindView(pageType.Template, new string[] { "templates\\{0}" });
            }
            else
            {
                this.PageContext.EditMode = EditModes.template ;
                pc.CmsContext.Template = new DocumentRequest()
                                         {
                                             Path = pageType.Template,
                                             ListFQN = "pageTemplateContent@mozu",
                                             DocumentTypeFQN = "pageTemplateContent@mozu"
                                         };
            }

            return Ok(view);
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
