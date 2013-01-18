using System;
using System.Web.Mvc;
using System.Linq;
using System.Xml.Linq;
using Mozu.SiteBuilder.Mvc.Navigation;
using System.Xml;
using System.IO;
using System.Text;
using Mozu.SiteBuilder.Mvc;
using System.Threading.Tasks;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class SitemapController : Controller
    {
        INavigationRepository _nav;
        INavigationRuntimeFactory _navFac;
        ISiteBuilderContext _sbctx;

        public SitemapController(INavigationRepository navigationRepository, INavigationRuntimeFactory navFac, ISiteBuilderContext sbctx)
        {
            _nav = navigationRepository;
            _navFac = navFac;
            _sbctx = sbctx;
        }

        // GET: /sitemap.xml
        public async Task<ActionResult> Index()
        {
            var primaryNav = _navFac.Primary;
            string domain = (await GetSitePrimaryDomain()).TrimEnd('/');

            //SiteBuilderContext.Current.PageContext.CanonicalUrl

            string[] products = new string[] { "bike1" };

            // TODO: all these urls should be absolute paths.
            XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            XDocument doc = new XDocument(
                new XDeclaration("1.0", "utf-8", "yes"),
                new XElement(ns + "urlset",
                    new XComment("oh hai, im fixin ur sitemaps"),
                    new XElement(ns + "url",
                        new XElement(ns + "loc", domain + "/"),
                        new XElement(ns + "priority", 1.0)),
                    from node in primaryNav
                    let url = node.Url.TrimStart('/')
                    select new XElement(ns + "url",
                        new XElement(ns + "loc", domain + "/" + url),
                        new XElement(ns + "priority", 0.5))
                )
            );

            // we use a StringWriter instead of doc.ToString() to ensure that the <?xml?> declaration is written intact.
            using (StringWriter w = new SitemapStringWriter())
            {
                doc.Save(w);
                return Content(w.ToString(), "application/xml");
            }
        }

        /// <summary>
        /// Gets the primary domain name for the current SiteContext.
        /// </summary>
        private async Task<string> GetSitePrimaryDomain()
        {
            int siteId = _sbctx.SiteId;

            // we have to use the service client to lookup a Site object by id
            var client = new SitesWebApiClient(new ServiceClientMessageHandler2(new ApiContext()));
            Site site = await client.GetSite(siteId).Result.ReadAsAsync();

            if (site != null)
            {
                Domain primary = site.Domains.FirstOrDefault(d => d.IsPrimary) ?? site.Domains.FirstOrDefault();
                if (primary != null)
                    return primary.FullName;
                else
                    return null;
            }
            else
            {
                return null;
            }
        }

        // stupid workaround to prevent the returned document from being UTF-16.
        // see http://stackoverflow.com/questions/5248400/why-does-the-xdocument-give-me-a-utf16-declaration
        private class SitemapStringWriter : StringWriter
        { 
            public override Encoding Encoding { get { return Encoding.UTF8; } }
        }
    }
}
