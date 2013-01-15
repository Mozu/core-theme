using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class HomeController : Controller
    {
        private INavigationRuntimeFactory _navigationRuntimeFactory;
        private readonly IWebToolsRepository _webToolsRepository;

        public HomeController(INavigationRuntimeFactory navigationRuntimeFactory, IWebToolsRepository webToolsRepository)
        {
            _navigationRuntimeFactory = navigationRuntimeFactory;
            _webToolsRepository = webToolsRepository;
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

        public async Task<ActionResult> GoogleSiteVerification(string hash)
        {
            var fileStream = await _webToolsRepository.GetWebMasterToolsFile(string.Format("google{0}.html", hash));

            return File(fileStream, "text/html");
        }
    }
}
