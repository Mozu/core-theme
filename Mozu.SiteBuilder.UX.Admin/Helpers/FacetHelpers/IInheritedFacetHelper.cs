using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DC = Mozu.ProductAdmin.Contracts;
using log4net.Config;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers
{
    public interface IInheritedFacetHelper
    {
        List<DC.Facet> GetOverridenFacetsToAdd(List<DC.Facet> inheritedClient, List<DC.Facet> inheritedServer, int currentCategoryId);

        List<DC.Facet> GetOverridenFacetsToUpdate(List<DC.Facet> overrideClient, List<DC.Facet> overrideServer,
            List<DC.Facet> inheritedServer);

        List<DC.Facet> GetOverridenFacetsToDelete(List<DC.Facet> overrideClient, List<DC.Facet> inheritedServer);

        List<DC.Facet> FilterInheritedFacetsThatAreOverriden(List<DC.Facet> facets, int currentCategoryId);

    }
}
