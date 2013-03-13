using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
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
    public class WidgetsController : BaseController
    {
        private readonly IViewEngine _viewEngine;
        private readonly IProductWebApiClient _productClient;

        ISiteBuilderContext _context;
        ICmsTypeHelper _cmsTypeHelper;
        ICmsServiceWrapper _cmsService;
        

        public WidgetsController(  IViewEngine viewEngine, IProductWebApiClient productClient, ISiteBuilderContext context, ICmsTypeHelper cmsTypeHelper, IProvisioningHelper provHelper, ICmsServiceWrapper cmsService)
        {
            _viewEngine = viewEngine;
            _productClient = productClient;
            _context = context;
            _cmsService = cmsService;
            

            _cmsTypeHelper = cmsTypeHelper;
            provHelper.ProvisionCms();
        }


        class JsonBinder : IModelBinder 
      {



            public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
            {
                if (controllerContext.RequestContext.HttpContext.Request.ContentType != "application/json")
                {
                    return null;
                }
                var stream = controllerContext.RequestContext.HttpContext.Request.InputStream;

                //if (stream.Length == 0)
                //{
                //    return null;
                //}
                //if (stream.Position != 0)
                //{
                //    if (!stream.CanSeek)
                //    {
                //        return null;
                //    }
                //    stream.Position = 0;
                //}

                var jsonReader = new JsonTextReader(new StreamReader(stream));
                var ser = new JsonSerializer();
                return ser.Deserialize(jsonReader, bindingContext.ModelType);
            }
      }

        [HttpPost()]
        public ActionResult Preview([ModelBinder(typeof(JsonModelBinder))] WidgetPreviewData wrd )
        {

           

            _context.IsEditMode = true;



            var def = _context.Theme.Widgets .First(x => x.Id == wrd.DefinitionId);

            wrd.Definition = def;
            wrd.IsPreview = true;

            if (wrd.Source == null)
            {
                switch (wrd.ZoneScope ?? "page")
                {
                    case "site":
                        {
                            wrd.Source = wrd.Context.SiteTemplateReq;
                            break;
                        }
                    case "template":
                        {
                            wrd.Source = wrd.Context.TemplateReq;
                            break;
                        }
                    default:
                        {
                            wrd.Source = wrd.Context.PageReq;
                            break;
                        }
                }
            }

            if (this.HttpContext.Request.ContentType == "application/json")
            {
                var tw = new StringWriter();
                var viewRes = _viewEngine.FindPartialView(this.ControllerContext, def.DisplayTemplate, true);

                if (viewRes.View != null)
                {
                    var vc = new ViewContext(this.ControllerContext, viewRes.View, new ViewDataDictionary(), this.TempData, tw);
                    vc.ViewData.Model = wrd;
                    viewRes.View.Render(vc, tw);
                }
                else
                {
                    throw new Exception("can't find template " + def.DisplayTemplate);
                }
                wrd.Output = tw.GetStringBuilder().ToString();

               
                return new JsonDCResult()
                {
                    Data = wrd,
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };

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
            if (ControllerContext == null || ControllerContext.HttpContext == null || ControllerContext.HttpContext.Items == null)
            {
                return false;
            }
            var hs = (HashSet<string>)ControllerContext.HttpContext.Items[key];
            if (hs == null)
            {
                ControllerContext.HttpContext.Items[key] = hs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
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

        public ActionResult Zone(List<string> widgetQuery, string zoneId)
        {
            if (HasVisitedZone(zoneId))
            {
                return new ContentResult()
                           {
                               Content = "<!--sof " + zoneId + "-->"
                           };
            }
            if (_context.PageContext == null || _context.PageContext.CmsContext == null || _context.PageContext.CmsContext.RuntimeData == null)
            {
                return new ContentResult()
                           {
                               Content = ""
                           };
            }
            var zoneWidgets = _context.PageContext.CmsContext.RuntimeData.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).OrderBy( x=> x.Index ).ToList();

            //StringBuilder sb = new StringBuilder();
            var tw = new StringWriter();
            foreach (var zw in zoneWidgets)
            {
                if (zw.Definition == null)
                {
                   zw.Definition =  _cmsTypeHelper.GetWidgetDefintion(zw.DefinitionId);
                }
                if (zw.Definition == null)
                {
                    continue;
                }
                var viewRes = _viewEngine.FindPartialView(this.ControllerContext, zw.Definition.DisplayTemplate, true);
                if (viewRes.View != null)
                {
                    var vc = new ViewContext(this.ControllerContext, viewRes.View, new ViewDataDictionary(), this.TempData, tw);
                    vc.ViewData.Model = zw;
                    viewRes.View.Render(vc, tw);
                }

            }
            return new ContentResult()
            {
                Content = tw.GetStringBuilder().ToString()
            };

        }

    }
}
