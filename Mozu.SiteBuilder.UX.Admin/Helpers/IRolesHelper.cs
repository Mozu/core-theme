using System;
using System.Collections.Generic;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface IRolesHelper
    {
        List<Tuple<Site, int>> SiteRolesList(string userId);

        bool RemoveRoleFromSite(int siteId, int roleId);
    }
}