using System.Web.Mvc;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.ErrorHandling;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class TestingController : Mozu.SiteBuilder.UX.Controllers.BaseController
    {
        ISitesWebApiClient WSRepo;
        public TestingController(ISitesWebApiClient  wsRepo )
        {
            WSRepo = wsRepo;
        }
        //
        // GET: /Misc/Testing/

        public ActionResult Index(  )
        {
            return View();
        }
        public ActionResult ChangeSite ()
        {
            
            var model = new ChangeSiteModel();
            return View(model);
        }
        [HttpPost ]
        public ActionResult ChangeSite(ChangeSiteModel model, FormCollection form)
        {
            Site  site = null;
            if (!string.IsNullOrEmpty(model.DomainName))
            {
                try
                {
                    site = WSRepo.GetSite(model.SiteId).Result.ReadAsAsync().Result;
                }
                catch (MozuApplicationException )
                {
                    throw;
                }
                if (site == null)
                {
                    this.ModelState.AddModelError("", "cant find domain name");

                }
            }
            else
            {

                try
                {
                    site = WSRepo.GetSite(model.SiteId).Result.ReadAsAsync().Result;
                }
                catch (MozuApplicationException )
                {
                    throw;
                    
                }
                if (site == null)
                {
                    this.ModelState.AddModelError("", "cant find site id");
                }
            }
            if (site != null)
            {
                this.SiteContext.TenantId = site.TenantId;
                this.SiteContext.SiteId = site.Id;
                this.SiteContext.Save();
               return Redirect("/");
            }
            return View(model);
        }
        //public ActionResult Tenant ()
        //{
        //    System.Text.StringBuilder sb = new System.Text.StringBuilder();
        //    sb.AppendFormat("<form method='post'>TenantID: <input type='textbox' name='id' value='{0}'/><br /><input type='submit' /></form>", this.SiteContext.Id);
        //    return new ContentResult (){ Content = sb.ToString ()};
            
        //}
        //[HttpPost()]
        //public ActionResult Tenant(string id , FormCollection col )
        //{
        //    var cookie = this.HttpContext.Request.Cookies["sitebuider"];
        //    if (cookie == null)
        //    {
        //        cookie = new HttpCookie("sitebuider");
        //    }
        //    cookie["tenant"] = id;
        //    this.HttpContext.Response.SetCookie(cookie);
        //    return RedirectToAction("index", "dashboard", new { area = "admin" });
        //}

        public class ChangeSiteModel
        {
            public string DomainName { get; set; }
            public int SiteId { get; set; }
        }
    }

}
