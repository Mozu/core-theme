using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [DataViewModeEnforcement]
    public class WidgetsController : BaseApiController
    {
        private readonly HyprViewEngine _viewEngine;

        public WidgetsController(HyprViewEngine viewEngine)
        {
            _viewEngine = viewEngine;
        }

        [HttpPost]
        public  Task<object> Preview(WidgetPreviewData<WidgetDefinition> wpd)
        {
            return WidgetPreview(wpd);
        }
        [HttpPost]
        public async Task<object> WidgetPreview(WidgetPreviewData<WidgetDefinition> wpd)
        {
            SiteContext.IsEditMode = true;
            SbApiContext.IsEditMode = true;
            SbApiContext.SetDataMode(DataViewModeType.Pending);

            var def = SiteContext.Theme.Widgets.First(x => x.Id == wpd.DefinitionId);

            wpd.Definition = def;
            wpd.IsPreview = true;
            wpd.Id ??= Guid.NewGuid().ToString();
            wpd.Config ??= def.DefaultConfig;
            wpd.Source ??= GetWidgetSource(wpd);
            wpd.Output = await RenderTemplate(wpd, d=> d.DisplayTemplate);

            return wpd;
        }

        [HttpPost]
        public async Task<object> LayoutPreview(WidgetPreviewData<LayoutWidgetDefinition> wpd)
        {
            SiteContext.IsEditMode = true;
            SbApiContext.IsEditMode = true;
            SbApiContext.SetDataMode(DataViewModeType.Pending);

            var def = SiteContext.Theme.Layouts.First(x => x.Id == wpd.DefinitionId);

            wpd.Definition = def;
            wpd.IsPreview = true;
            wpd.Id ??= Guid.NewGuid().ToString();
            wpd.Config ??= def.DefaultConfig;
            wpd.Source ??= GetWidgetSource(wpd);
            wpd.Output = await RenderTemplate(wpd, d => d.DisplayTemplate);

            return wpd;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="wpd"></param>
        /// <param name="displayTemplateFunc">this needs to assume the presence of some shared root, either widgets/ or layoutwidgets/</param>
        /// <returns></returns>
        private async Task<string> RenderTemplate<T>(WidgetPreviewData<T> wpd, Func<T, string> displayTemplateFunc)
        {
            var tw = new StringWriter();
            var root = string.IsNullOrEmpty(wpd.widgetType) || wpd.widgetType.Equals("content") ? "widgets/" : "layoutWidgets/";
            var template = displayTemplateFunc(wpd.Definition);
            var view = _viewEngine.FindModuleView(root + template);
            if (view != null)
            {
                var viewContext = new HyprViewContext(Request.HttpContext, new ViewDataDictionary<WidgetPreviewData<T>>(null, wpd));
                await view.AsyncRender(viewContext, tw).ConfigureAwait(false);
                RenderScriptsTag.RenderRequiresForWidgetPreview(tw, HttpContext);
            }
            else
            {
                throw new Exception("can't find template " + template);
            }

            tw.Flush();
            return tw.ToString();
        }

        private static DocumentRequest GetWidgetSource<T>(WidgetPreviewData<T> wpd)
        {
            switch (wpd.ZoneScope ?? "page")
            {
                case "site":
                {
                    return wpd.Context.SiteTemplate;
                }
                case "template":
                {
                    return wpd.Context.Template;
                }
                case "page":
                {
                    return wpd.Context.Page;
                }
                default:
                {
                    throw new Exception($"Could not find preview context for zone {wpd.ZoneScope}");
                }
            }
        }
    }
}
