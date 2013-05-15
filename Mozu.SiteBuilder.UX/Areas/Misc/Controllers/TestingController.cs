using System.Web.Mvc;
using System.Linq;
using Mozu.Core.Settings;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.ErrorHandling;
using System.Threading.Tasks;
using System;
using System.Net;
using System.Web;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class TestingController : Mozu.SiteBuilder.UX.Controllers.BaseController
    {
        ISitesWebApiClient _wsRepo;
        ITenantsWebApiClient _tRepo;
        ICookieProvider _cookies;
        private readonly ISettings _settings;

        public TestingController(ISitesWebApiClient  wsRepo, ITenantsWebApiClient tRepo, ICookieProvider cookies, ISettings settings  )
        {
            _wsRepo = wsRepo;
            _tRepo = tRepo;
            _cookies = cookies;
            _settings = settings;
            SuppressMissingContextRedirect = true;
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
        /// Updates the sitebuildercontext and redirects the 
        /// GET: /_gosite/(siteid)?redir=...&environment=...
        /// </summary>
        public async Task<ActionResult> GoSite(int siteId, string redir= null, string environment= "production")
        {
            var res = await _wsRepo.GetSite(siteId);
            var site = res.ReadAsAsync().Result;

            this.SiteContext.SiteId = siteId;
            this.SiteContext.TenantId = site.TenantId;
            this.SiteContext.SiteGroupId = site.SiteGroupId;
            this.SiteContext.Save();

            //string domainPriority = System.Configuration.ConfigurationManager.AppSettings["gositeDomainPriority"];
            IEnumerable<string> domainList;
            switch ((environment??"").ToLower())
            {
                case "primary":
                    domainList = site.Domains.OrderBy(s => s.IsPrimary).Select(x => x.DomainName);
                    break;
                case "preview":
                case "admin-pending":
                case "staging":
                    domainList = site.Domains.Where(x => x.IsSystemAssigned).Select(x => "admin-pending-view." + x.DomainName );
                    break;
                default:
                    domainList = site.Domains.Select(x => x.DomainName);
                    break;
            }


            
            string newHostname = (domainList.FirstOrDefault()) ;
            bool doHostnameRedirect = Convert.ToBoolean(System.Configuration.ConfigurationManager.AppSettings["gositeRedirectsHostname"]) && !String.IsNullOrEmpty(newHostname);
            
            if (!String.IsNullOrEmpty(redir))
            {
                string redirUrl = Uri.UnescapeDataString(redir).TrimStart('/');

                if (doHostnameRedirect)
                {
                    redirUrl = "http://" + newHostname + "/" + redirUrl;
                }
                else
                {
                    redirUrl = "~/" + redirUrl;
                }
                    

                return new RedirectResult(redirUrl);
            }
            else
            {
                string redirUrl = doHostnameRedirect ? "http://" + newHostname : "~/";
                return new RedirectResult(redirUrl);
            }
        }

        [HttpPost]
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
