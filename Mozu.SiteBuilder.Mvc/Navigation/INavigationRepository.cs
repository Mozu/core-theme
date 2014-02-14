using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public interface INavigationRepository
    {
        Task<NavigationSet> GetNavigationSetAsync();

        Task SaveSetAsync(NavigationSet set);
    }
}