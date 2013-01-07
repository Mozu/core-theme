using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class HomeController : Controller
    {
        private INavigationRuntimeFactory _navigationRuntimeFactory;
        public HomeController(INavigationRuntimeFactory navigationRuntimeFactory)
        {
            _navigationRuntimeFactory = navigationRuntimeFactory;
        }

        //
        // GET: /StoreFront/Home/
        
        public ActionResult Index()
        {
            if ( _navigationRuntimeFactory.Primary != null && _navigationRuntimeFactory.Primary.Count > 0)
            {
                var item = _navigationRuntimeFactory.Primary.FirstOrDefault(x => !string.IsNullOrEmpty(x.Url));
                if ( item != null )
                {
                    return new TransferResult(item.Url );
                }
            }

            return new TransferResult("/pages/home");
           // return RedirectToAction("home", "CmsPages");
            //  return RedirectToAction("index", "dashboard", new { area = "admin" });
            //return View();
        }
    }
}
