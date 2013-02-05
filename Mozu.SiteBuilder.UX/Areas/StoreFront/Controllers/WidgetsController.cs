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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class WidgetsController : BaseController
    {

        private readonly IProductWebApiClient _productClient;

        ISiteBuilderContext _context;
        ICmsTypeHelper _cmsTypeHelper;
        ICmsServiceWrapper _cmsService;
        private readonly IWidgetProvider _widgetProvider;

        public WidgetsController(IProductWebApiClient productClient, ISiteBuilderContext context, ICmsTypeHelper cmsTypeHelper, IProvisioningHelper provHelper, ICmsServiceWrapper cmsService, IWidgetProvider widgetProvider)
        {
            _productClient = productClient;
            _context = context;
            _cmsService = cmsService;
            _widgetProvider = widgetProvider;

            _cmsTypeHelper = cmsTypeHelper;
            provHelper.ProvisionCms();
        }

        
      

        [HttpPost()]
        public ActionResult Preview(WidgetPreviewContext context)
        {
            _context.IsEditMode = true;
           
          

            var def = _widgetProvider.GetWidgets().First(x => x.Id == context.DefinitionId);

            var wrd = new WidgetRuntimeData()
                {
                    Definition = def,
                    DefinitionId = context.DefinitionId ,
                    ConfigurationData = context.ConfigurationData,
                    Index = context.Index ,
                    ZoneId = context.ZoneId,
                    ZoneScope = context.ZoneScope,
                    IsPreview = true
                };

           


            if (this.HttpContext.Request.ContentType == "application/json")
            {
                var tw = new StringWriter();
                var viewRes = System.Web.Mvc.ViewEngines.Engines[0].FindPartialView(this.ControllerContext, def.DisplayTemplate, true);

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
                context.Output = tw.GetStringBuilder().ToString();

                var jsonData = new WidgetPreviewContext()
                {
                    Output = tw.GetStringBuilder().ToString(),
                    

                };

                return new JsonDCResult()
                {
                    Data = context,
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

                var viewRes = System.Web.Mvc.ViewEngines.Engines[0].FindPartialView(this.ControllerContext, zw.Definition.DisplayTemplate, true);
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
