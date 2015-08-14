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
        public async Task<object> Preview(WidgetPreviewData wpd)
        {
            SiteContext.IsEditMode = true;
            SbApiContext.IsEditMode = true;
            SbApiContext.SetDataMode(DataViewModeType.Pending);

            var def = SiteContext.Theme.Widgets.First(x => x.Id == wpd.DefinitionId);

            wpd.Definition = def;
            wpd.IsPreview = true;
            wpd.Id = wpd.Id ?? Guid.NewGuid().ToString();
            wpd.Config = wpd.Config ?? def.DefaultConfig;
            wpd.Source = wpd.Source ?? GetWidgetSource(wpd);
            wpd.Output = await RenderTemplate(wpd, def);

            return wpd;
        }

        private async Task<string> RenderTemplate(WidgetPreviewData wpd, WidgetDefinition def)
        {
            var tw = new StringWriter();
            var view = _viewEngine.FindModuleView("widgets/" + def.DisplayTemplate);
            if (view != null)
            {
                var viewContext = new HyprViewContext(Request, new ViewDataDictionary { Model = wpd });
                await view.AsyncRender(viewContext, tw).ConfigureAwait(false);
                RenderScriptsTag.RenderRequiresForWidgetPreview(tw, HttpContext);
            }
            else
            {
                throw new Exception("can't find template " + def.DisplayTemplate);
            }

            tw.Flush();
            return tw.ToString();
        }

        private static DocumentRequest GetWidgetSource(WidgetPreviewData wpd)
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
                    throw new Exception(string.Format("Could not find preview context for zone {0}", wpd.ZoneScope));
                }
            }
        }
    }
}
