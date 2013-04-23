using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// Abstracts the admin/runtime distinction of categories and
    /// returns a list of NavigationTreeNodes.
    /// </summary>
    public interface ICategoryNavigationProvider
    {
        /// <summary>
        /// Abstracts the admin/runtime distinction of categories and
        /// returns a list of NavigationTreeNodes.
        /// </summary>
        Task<List<NavigationTreeNode>> GetCategories();
    }
}
