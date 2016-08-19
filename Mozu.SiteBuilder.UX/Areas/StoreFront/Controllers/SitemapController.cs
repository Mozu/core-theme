using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Navigation;
using System.Xml;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.Mvc.Helpers;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [DataViewModeEnforcement]
    public class SitemapController : BaseApiController
    {
        INavigationRepository _nav;
    
        private readonly ISitesWebApiClient _sitesWebApi;

        private readonly IProductRuntimeWebApiClient _productSearchWebApiClient;
        private INavigationGandalf _gandalf;
        private const int PageSize = 2000;
        ICategoryTreeProvider _categoryTreeProvider = null;
        UrlHelper _urlHelper;
        const string NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
        public SitemapController(INavigationRepository navigationRepository,ISitesWebApiClient sitesWebApiClient , INavigationGandalf gandalf,  Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient productSearchWebApiClient, 
            UrlHelper urlHelper,
            ICategoryTreeProvider categoryTreeProvider)
        {
            _nav = navigationRepository;
            _gandalf = gandalf;
            _urlHelper = urlHelper;
            _sitesWebApi = sitesWebApiClient;
            _productSearchWebApiClient = productSearchWebApiClient;
            _categoryTreeProvider = categoryTreeProvider;
        }

           [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> Index()
        {

            var prods = (await _productSearchWebApiClient.GetProducts( pageSize: 0)).ReadAsSync();
            var resp = this.Request.CreateResponse(HttpStatusCode.OK);
            int pages = (int)Math.Ceiling((decimal)prods.TotalCount/(decimal)PageSize);
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
            var nakedDomain = GetNakedSitePrimaryDomain();
           
            var scheme = PageContext.IsSecure ? "https://" : "http://";
            var prefixedDomain = scheme + nakedDomain;
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
            writer.WriteStartElement("sitemapindex", NS);

            writer.WriteStartElement("sitemap", NS);
            writer.WriteElementString("loc", NS, prefixedDomain + "/sitemap.xml/categories");
            writer.WriteEndElement();


            for (int i = 0; i < pages; i++)
            {
                writer.WriteStartElement("sitemap", NS);
                writer.WriteElementString("loc", NS, prefixedDomain + "/sitemap.xml/products/" + i);
                writer.WriteEndElement();
            }
            writer.WriteEndElement();
            writer.Flush();
            return resp;
        }

        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> Categories()
        {
            // var primaryNavTask = _gandalf.GetTreeNavigation();
            //var domainTask = GetSitePrimaryDomain();
            var nodes = await _gandalf.GetFlatList();


            var domain = GetPrefixedSitePrimaryDomain();
            var resp = this.Request.CreateResponse(HttpStatusCode.OK);

            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
            // resp.Content.
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
            writer.WriteStartElement("urlset", NS);


            writer.WriteStartElement("url", NS);
            writer.WriteElementString("loc", NS, domain);
            //  writer.WriteElementString("lastmod", NS, );
            writer.WriteElementString("changefreq", NS, "daily");
            writer.WriteElementString("priority", NS, "1");
            writer.WriteEndElement();

            foreach (var node in nodes.Where(x => !x.IsHidden && !string.IsNullOrEmpty(x.Url)))
            {
                var url = (node as SuperNavigationNode)?.FqUrl ?? node.Url;
                writer.WriteStartElement("url", NS);
                writer.WriteElementString("loc", NS, url.StartsWith("/") ? domain + url : url);
                //  writer.WriteElementString("lastmod", NS, );
                writer.WriteElementString("changefreq", NS, "daily");
                writer.WriteElementString("priority", NS, ".7");
                writer.WriteEndElement();
            }
            writer.WriteEndElement();
            writer.Flush();
            return resp;
        }

         [System.Web.Http.HttpGet]
           public async Task<HttpResponseMessage> Products(int page)
           {
               var prefixDomain =  GetPrefixedSitePrimaryDomain();
            var nakedDomain = GetNakedSitePrimaryDomain();
               
               var resp = this.Request.CreateResponse(HttpStatusCode.OK);
               var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
               // resp.Content.
               this.HttpContext.Response.ContentType = "text/xml";
               var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
               writer.WriteStartElement("urlset", NS);
             int offset = 0;
             var startIndex = page*PageSize;

            //initialize the category Tree for later.
            await _categoryTreeProvider.GetAllCategories();

            while (true)
             {
                var prods = (await _productSearchWebApiClient.CloneWithoutUserClaims()
                    .CloneWithConfigOptions(cfg=>cfg.TimeoutMilliseconds = 60000)
                    .GetProducts(pageSize: PageSize, startIndex: startIndex, responseGroups: "urlonly", responseFields: "items(productCode, categories, content(SEOFriendlyUrl))")).ReadAsSync();
                

                var vm = Mapper.Map<ProductCollection>(prods);
                vm.Init(false, PageContext.Search);
                 WriteProducts(vm, writer, prefixDomain, nakedDomain, _urlHelper);
                 startIndex = startIndex + prods.PageSize;
                 if (startIndex >= (page+1) * PageSize || startIndex >= prods.TotalCount || prods.PageCount == 0 )
                 {
                     break;
                 }
                
             }
             writer.WriteEndElement();
               writer.Flush();
               return resp;

           }

        private static void WriteProducts(ProductCollection vm, XmlWriter writer, string prefixedDomain,string nakedDomain, UrlHelper urlHelper)
        {

            foreach (var prod in vm.Items)
            {
                writer.WriteStartElement("url", NS);
                
               
                var url = urlHelper.MakeUrl(UrlHelper.UrlType.Product, prod, null, hostname : nakedDomain);
           
                writer.WriteElementString("loc", NS, url.StartsWith("/") ? prefixedDomain + url : url);
                //  writer.WriteElementString("lastmod", NS, );
                writer.WriteElementString("changefreq", NS, "daily");
                writer.WriteElementString("priority", NS, ".7");
                writer.WriteEndElement();
            }
        }


        private string GetPrefixedSitePrimaryDomain()
        {

            var primary = SiteContext.Domains.Primary;

            if (primary != null)
            {
                return "http://" + primary.DomainName;
            }
            else
            {
                return null;
            }
        }
        private string GetNakedSitePrimaryDomain()
        {
            return SiteContext.Domains.Primary?.DomainName;
        }


    }
}
