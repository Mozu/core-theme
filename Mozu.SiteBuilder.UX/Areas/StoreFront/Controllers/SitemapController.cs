using System;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class SitemapController : Controller
    {
        INavigationRepository _nav;

        public SitemapController(INavigationRepository navigationRepository)
        {
            _nav = navigationRepository;
        }

        // GET: /sitemap.xml
        public ActionResult Index()
        {
            var set = _nav.GetSet();

            return Content("oh hai, im fixin ur sitemaps");
        }

    }
}
