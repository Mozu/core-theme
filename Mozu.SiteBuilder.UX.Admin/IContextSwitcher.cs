using System.Threading.Tasks;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Admin
{
    public interface IContextSwitcher
    {
        Task<Tenant.Contracts.Tenant> ChangeTenant(int tenantId);

        Task<Site> ChangeSite(int siteId);
    }
}