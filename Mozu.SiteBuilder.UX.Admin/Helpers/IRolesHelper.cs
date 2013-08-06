using System;
using System.Collections.Generic;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface IRolesHelper
    {
        List<Tenant.Contracts.Tenant> SiteRolesList(string userId);

        bool RemoveRoleFromSite(int siteId, int roleId);
    }
}