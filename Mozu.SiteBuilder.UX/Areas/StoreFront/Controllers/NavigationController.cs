using System.Collections.Generic;
using System.Linq;

using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{

    public class NavigationController : BaseApiController
    {
        private readonly INavigationRepository _navigationRepository;

        public NavigationController(INavigationRepository navigationRepository)
        {
            _navigationRepository = navigationRepository;
        }

        public List<NavigationNode > Primary()
        {
            return GetPrimaryNodes();
            
        }

        public List<NavigationNode> Secondary(string parentId)
        {
            return  GetSecondaryNodes(parentId);
           
        }

        private List<NavigationNode> GetPrimaryNodes()
        {
            var navigationSet = _navigationRepository.GetSetAsync().Result;
            return navigationSet.Nodes.Where(n => n.ParentId == null).ToList();
        }

        private List<NavigationNode> GetSecondaryNodes(string parentId)
        {
            var navigationSet = _navigationRepository.GetSetAsync().Result;
            return navigationSet.Nodes.Where(n => n.ParentId == parentId).ToList();
        }
    }
}