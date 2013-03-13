using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.ServiceModel.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class WidgetDefinitionController : BaseController
    {
        private readonly ISiteBuilderContext _siteBuilderContext;
      

        public WidgetDefinitionController(ISiteBuilderContext siteBuilderContext  )
        {
            _siteBuilderContext = siteBuilderContext;
         
        }

        [WebGet(UriTemplate = "read")]
        public Response<List<WidgetDefinition>> GetWidgets([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var defs = _siteBuilderContext.Theme.Widgets;

            return List2(defs.ToList());
        }
    }
}
