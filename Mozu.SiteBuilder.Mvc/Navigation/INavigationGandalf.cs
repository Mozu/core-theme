using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public interface INavigationGandalf
    {
        /// <summary>
        /// Build a flat list of NavigationNodes (which can have a ParentId to imply a hiearchy)
        /// This list can then be transformed to a List[NavigationRuntimeNode] or List[NavigationTreeNode]
        /// </summary>
        Task<List<ITreeNavigationNode>> GetFlatList();

        /// <summary>
        /// Build a hierarchical list of navigation nodes, ideal for consumption by NDjango templates and front-end javascript.
        /// </summary>
        Task<List<IRuntimeNavigationNode>> GetTreeNavigation();
    }
}
