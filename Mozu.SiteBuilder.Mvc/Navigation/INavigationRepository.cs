using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public interface INavigationRepository
    {
        Task<NavigationSet> GetSet();

        Task<bool> SaveSet(NavigationSet set);

        Task<string> GetNavMetaDocumentId();
    }
}