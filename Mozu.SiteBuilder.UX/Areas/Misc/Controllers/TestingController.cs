using System.Web.Mvc;
using System.Linq;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.ErrorHandling;
using System.Threading.Tasks;
using System;
using System.Net;
using System.Web;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class TestingController : Mozu.SiteBuilder.UX.Controllers.BaseController
    {
        ISitesWebApiClient _wsRepo;
        ITenantsWebApiClient _tRepo;
        ICookieProvider _cookies;

        public TestingController(ISitesWebApiClient  wsRepo, ITenantsWebApiClient tRepo, ICookieProvider cookies )
        {
            _wsRepo = wsRepo;
            _tRepo = tRepo;
            _cookies = cookies;
        }

        //
        // GET: /Misc/Testing/

        public ActionResult Index(  )
        {
            return View();
        }

        /// <summary>
        /// Returns a hyperlinked list of all available sites.
        /// GET: /Misc/Testing/SiteList
        /// </summary>
        public async Task<ActionResult> SiteList()
        {
            var tRes = await _tRepo.GetTenants(0, 200, null, null);

            TenantCollection tenants = tRes.ReadAsAsync().Result;

            return View(tenants);
        }

        /// <summary>
        /// Returns a hyperlinked list of all available sites.
        /// GET: /_gosite/(siteid)?redir=...
        /// </summary>
        public async Task<ActionResult> GoSite(int siteId, string redir)
        {
            var res = await _wsRepo.GetSite(siteId);
            var site = res.ReadAsAsync().Result;

            this.SiteContext.SiteId = siteId;
            this.SiteContext.TenantId = site.TenantId;
            this.SiteContext.SiteGroupId = site.SiteGroupId;
            this.SiteContext.Save();
            ;
            // fuck it.
            //string contextString = String.Format("tenant={0}&sitegroup={1}&site={2}", site.TenantId, site.SiteGroupId, site.Id);
            //var c1 = new HttpCookie("SBCONTEXT", contextString);
            //var c2 = new HttpCookie("SBCONTEXT2", contextString);

            //_cookies.SaveResponseCookie(c1.Name, c1);
            //_cookies.SaveResponseCookie(c2.Name, c2);

            if (!String.IsNullOrEmpty(redir))
            {
                return new RedirectResult(redir);
            }
            else
            {
                return new RedirectResult("~/");
            }
        }

        [HttpPost ]
        public ActionResult ChangeSite(ChangeSiteModel model, FormCollection form)
        {
            Site  site = null;
            if (!string.IsNullOrEmpty(model.DomainName))
            {
                try
                {
                    site = _wsRepo.GetSite(model.SiteId).Result.ReadAsAsync().Result;
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
                    site = _wsRepo.GetSite(model.SiteId).Result.ReadAsAsync().Result;
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
