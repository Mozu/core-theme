using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class NavigationController : BaseController
    {
        private readonly INavigationRepository _navigationRepository;

        public NavigationController(INavigationRepository navigationRepository)
        {
            _navigationRepository = navigationRepository;
        }

        public ActionResult Primary()
        {
            var primaryNodes = GetPrimaryNodes();
            return Json(primaryNodes, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Secondary(string parentId)
        {
            var secondaryNodes = GetSecondaryNodes(parentId);
            return Json(secondaryNodes, JsonRequestBehavior.AllowGet);
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