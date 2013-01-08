using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.ServiceModel.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class WidgetDefinitionController : BaseController
    {
        private readonly IWidgetProvider _widgetProvider;

        public WidgetDefinitionController(IWidgetProvider widgetProvider)
        {
            _widgetProvider = widgetProvider;
        }

        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<WidgetDefintion>>> GetWidgets(PagingParamaters pagingParams, FilterCollection extFilter )
        {
            var defs = _widgetProvider.GetWidgets();

            return List(defs.ToList());
        }
    }
}
