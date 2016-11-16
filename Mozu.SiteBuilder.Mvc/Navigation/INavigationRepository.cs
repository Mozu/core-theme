using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// Repository to access the navigation metadocument in CMS.
    /// </summary>
    public interface INavigationRepository
    {
        Task<IList<INavigationNode>> GetNavigationSetAsync();

        Task SaveSetAsync(IList<INavigationNode> set);
    }
}
