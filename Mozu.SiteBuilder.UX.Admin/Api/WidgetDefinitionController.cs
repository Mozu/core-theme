using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/widgetdefinition", SuppressDescriptorGeneration = true)]
    public class WidgetDefinitionController : BaseController
    {
        private readonly IThemeRepository _themeRepository;


        public WidgetDefinitionController(IThemeRepository themeRepository)
        {
            _themeRepository = themeRepository;
            //  _siteContext = siteContext;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public Response<List<WidgetDefinition>> GetWidgets([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string themeId= null)
        {
            var theme = _themeRepository.GetTheme(new ThemeSelection() { Id = themeId });
            var defs = theme.Widgets;

            return List2(defs.ToList());
        }
    }
}
