using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers
{
    public interface IFacetUpdater
    {
        Task<FacetSet> UpdateFacetSet(FacetSet set);
    }
}