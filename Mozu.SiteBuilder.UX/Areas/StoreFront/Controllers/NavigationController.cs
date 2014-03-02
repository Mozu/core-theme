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

        public List<INavigationNode > Primary()
        {
            return GetPrimaryNodes();
            
        }

        public List<INavigationNode> Secondary(string parentId)
        {
            return  GetSecondaryNodes(parentId);
           
        }

        private List<INavigationNode> GetPrimaryNodes()
        {
            var navigationSet = _navigationRepository.GetNavigationSetAsync().Result;
            return navigationSet.Where(n => n.ParentId == null).ToList();
        }

        private List<INavigationNode> GetSecondaryNodes(string parentId)
        {
            var navigationSet = _navigationRepository.GetNavigationSetAsync().Result;
            return navigationSet.Where(n => n.ParentId == parentId).ToList();
        }
    }
}