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
    [WebApi("app/layoutwidgetdefinition", SuppressDescriptorGeneration = true)]
    public class LayoutWidgetDefinitionController : BaseController
    {
        private readonly IThemeRepository _themeRepository;

        SiteContext _siteContext;
        public LayoutWidgetDefinitionController(IThemeRepository themeRepository, SiteContext siteContext)
        {
            _themeRepository = themeRepository;
            _siteContext = siteContext;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<LayoutWidgetDefinition>>> GetWidgets([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string themeId)
        {
            Theme theme = null;
            if (string.IsNullOrEmpty(themeId))
            {
                theme = _siteContext.Theme;
            }
            else
            {
                theme = await _themeRepository.GetTheme(new ThemeSelection() { Id = themeId }).ConfigureAwait(false);
            }

            var defs = theme.Layouts;

            return List2(defs.ToList());
        }
    }
}
