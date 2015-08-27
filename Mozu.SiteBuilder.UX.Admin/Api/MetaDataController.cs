using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.ServiceModel.Web;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Metadata;
using System.ServiceModel;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/metadata", SuppressDescriptorGeneration = true)]
    public class MetaDataController : BaseController
    {
        static Lazy<List<ModelDescription>> g_desc = new Lazy<List<ModelDescription>>(CreateModelDescriptions, true);

        [HttpGetRoute(UriTemplate = "list?id={id}&page={pageIndex}&start={startIndex}&limit={pageSize}")]
        public Response<List<ModelDescription>> GetOptionList(string id = null, int pageIndex = 1, int startIndex = 0, int pageSize = 25)
        {
            List<ModelDescription> mds = null;
            if (!string.IsNullOrEmpty (id ))
            {
                mds = g_desc.Value.Where(x => string.Equals(x.OrigionalType.Name, id, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            else
            {
                mds = g_desc.Value;
            }
            return List2(mds);
        }

        static List<ModelDescription> CreateModelDescriptions()
        {
            var modelModels = typeof (Mozu.SiteBuilder.UX.Admin.Api.Models.GeneralSettings.IPBlock )
                .Assembly.GetTypes()
                .Where(x => x.Namespace != null && x.Namespace.StartsWith("Mozu.SiteBuilder.UX.Models.Settings"))
                .Select(x => ModelDescription.Create(x))
                .ToList();
            return typeof(MetaDataController).Assembly.GetTypes()
                .Where(x => x.Namespace != null && x.Namespace.StartsWith("Mozu.SiteBuilder.UX.Admin.Api.Models"))
                .Select(x => ModelDescription.Create(x))
                .Union(
                    modelModels
                ).ToList();

        }

    }
}