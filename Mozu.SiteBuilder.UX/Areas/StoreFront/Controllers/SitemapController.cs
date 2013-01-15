using System;
using System.Web.Mvc;
using System.Linq;
using System.Xml.Linq;
using Mozu.SiteBuilder.Mvc.Navigation;
using System.Xml;
using System.IO;
using System.Text;

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


            int[] categories = new int[] { 2000, 20001 };
            string[] pages = new string[] { "home" };
            string[] products = new string[] { "bike1" };

            // TODO: all these urls should be absolute paths.
            XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            XDocument doc = new XDocument(
                new XDeclaration("1.0", "utf-8", "yes"),
                new XElement(ns + "urlset",
                    new XComment("oh hai, im fixin ur sitemaps"),
                    new XElement(ns + "url",
                        new XElement(ns + "loc", "/"),
                        new XElement(ns + "priority", 1.0)),
                    from c in categories
                    select new XElement(ns + "url",
                        new XElement(ns + "loc", "/category/" + c),
                        new XElement(ns + "priority", 0.5)),
                    from p in pages
                    select new XElement(ns + "url",
                        new XElement(ns + "loc", "/pages/" + p),
                        new XElement(ns + "priority", 0.5)),
                    from pr in products
                    select new XElement(ns + "url",
                        new XElement(ns + "loc", "/product/" + pr),
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

        // stupid workaround to prevent the returned document from being UTF-16.
        // see http://stackoverflow.com/questions/5248400/why-does-the-xdocument-give-me-a-utf16-declaration
        private class SitemapStringWriter : StringWriter
        { 
            public override Encoding Encoding { get { return Encoding.UTF8; } }
        }
    }
}
