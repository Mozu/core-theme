using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.ProductAdmin.Contracts.Clients;
using System.Runtime.Serialization;

using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Runtime.Serialization.Json;
using Mozu.SiteBuilder.Mvc;
using Mozu.Content.Contracts.Clients;
using System.Text;
using System.IO;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class WidgetsController : BaseApiController
    {
        

        
        ICmsTypeHelper _cmsTypeHelper;
        private readonly HyprViewEngine _viewEngine;
        ICmsServiceWrapper _cmsService;
        private readonly IThemeEntityDefinitionProvider _themeEntityDefinitionProvider;


        public WidgetsController(HyprViewEngine viewEngine, ICmsTypeHelper cmsTypeHelper, ICmsServiceWrapper cmsService, IThemeEntityDefinitionProvider themeEntityDefinitionProvider)
        {
            _viewEngine = viewEngine;


            _viewEngine = viewEngine;
            _cmsService = cmsService;
            _themeEntityDefinitionProvider = themeEntityDefinitionProvider;


            _cmsTypeHelper = cmsTypeHelper;
        }


     

        [HttpPost()]
        public object  Preview( WidgetPreviewData wrd )
        {

           

            this.SiteContext.IsEditMode = true;



            var def = SiteContext.Theme.Widgets.First(x => x.Id == wrd.DefinitionId);

            wrd.Definition = def;
            wrd.IsPreview = true;
            
            wrd.Id = wrd.Id ?? Guid.NewGuid().ToString();
            wrd.Config = wrd.Config ?? def.DefaultConfig;



            if (wrd.Source == null)
            {
                switch (wrd.ZoneScope ?? "page")
                {
                    case "site":
                        {
                            wrd.Source = wrd.Context.SiteTemplate;
                            break;
                        }
                    case "template":
                        {
                            wrd.Source = wrd.Context.Template;
                            break;
                        }
                    default:
                        {
                            wrd.Source = wrd.Context.Page;
                            break;
                        }
                }
            }

            if (this.HttpContext.Request.ContentType == "application/json")
            {
                var tw = new StringWriter();
               
                
                var view = _viewEngine.FindModuleView( "widgets/" + def.DisplayTemplate);
                if (view != null)
                {
                    var viewContext = new HyprViewContext(this.Request  , new ViewDataDictionary() {Model = wrd});

                    view.Render(viewContext, tw);
                }
                else
                {
                    throw new Exception("can't find template " + def.DisplayTemplate);
                }


                wrd.Output = tw.GetStringBuilder().ToString();


                return wrd;

            }
            else
            {
                var vr = View(wrd);
                vr.ViewName = def.DisplayTemplate;
                return vr;
            }


        }


        bool HasVisitedZone(string zoneId)
        {
            string key = "visitedZones";
            if (ControllerContext == null || HttpContext == null || HttpContext.Items == null)
            {
                return false;
            }
            var hs = (HashSet<string>)HttpContext.Items[key];
            if (hs == null)
            {
                HttpContext.Items[key] = hs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            }
            if (hs.Contains(zoneId ?? ""))
            {
                return true;
            }
            else
            {
                hs.Add(zoneId ?? "");
                return false;
            }
        }

      
    }
}
