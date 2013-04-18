using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public interface INavigationRepository
    {
        NavigationSet GetSet();

        void SaveSet(NavigationSet set);
    }

    public interface INavigationRepositoryAsync : INavigationRepository
    {
        Task<NavigationSet> GetSetAsync();

        Task SaveSetAsync(NavigationSet set);
    }
}