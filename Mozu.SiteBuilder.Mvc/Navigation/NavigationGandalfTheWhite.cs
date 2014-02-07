using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// After his defeat by the Balrog of Performance Testing, Gandalf the Grey has
    /// returned to the magical world of Mozu Sitebuilder as Gandalf The White.
    /// </summary>
    public class NavigationGandalfTheWhite : INavigationGandalf
    {
        public Task<List<NavigationTreeNode>> GetFlatList()
        {
            var t = new TaskCompletionSource<List<NavigationTreeNode>>();
            t.SetResult( Enumerable.Empty<NavigationTreeNode>().ToList() );
            return t.Task;
        }

        public Task<List<NavigationRuntimeNode>> GetTreeNavigation()
        {
            var t = new TaskCompletionSource<List<NavigationRuntimeNode>>();
            t.SetResult( Enumerable.Empty<NavigationRuntimeNode>().ToList() );
            return t.Task;
        }
    }
}
