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
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [DataViewModeEnforcement]
    public class SitemapController : BaseApiController
    {
        private readonly IProductRuntimeWebApiClient _productRuntimeWebApiClient;
        private readonly INavigationGandalf _gandalf;
        private const int PageSize = 2000;
        private readonly IProductSearchWebApiClient _productSearchWebApiClient;
        private readonly UrlHelper _urlHelper;
        private readonly ISiteBuilderContextProvider _siteBuilderContextDataProvider;
        private const string NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
        private readonly ISiteContext _siteContext;

        public SitemapController(INavigationGandalf gandalf, 
            IProductRuntimeWebApiClient productRuntimeWebApiClient,
            IProductSearchWebApiClient productSearchWebApiClient,
            UrlHelper urlHelper,
            ISiteBuilderContextProvider siteBuilderContextDataProvider,
            ISiteContext siteContext)
        {
            _gandalf = gandalf;
            _urlHelper = urlHelper;
            _productSearchWebApiClient = productSearchWebApiClient;
            _productRuntimeWebApiClient = productRuntimeWebApiClient;
            _siteBuilderContextDataProvider = siteBuilderContextDataProvider;
            _siteContext = siteContext;
        }

        [System.Web.Http.HttpGet]
        public async Task<IActionResult> Index()
        {
            var cursor = (await _productSearchWebApiClient
                .CloneWithoutUserClaims()
                .GetRandomAccessCursor(pageSize: 2000)
                .ConfigureAwait(false))
                .ReadAsSync();

            var resp = Ok();
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
            var nakedDomain = GetNakedSitePrimaryDomain();
            var scheme = PageContext.IsSecure ? "https://" : "http://";
            var prefixedDomain = scheme + nakedDomain + _siteContext.SiteSubdirectory;
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(HttpContext.Response.Body);

            writer.WriteStartElement("sitemapindex", NS);
            writer.WriteStartElement("sitemap", NS);
            writer.WriteElementString("loc", NS, prefixedDomain + "/sitemap.xml/categories");
            writer.WriteEndElement();

            var isOnSiteDomain =
                this.SiteContext.Domains.All.FirstOrDefault(sd =>
                    string.Equals(sd.DomainName, nakedDomain, StringComparison.OrdinalIgnoreCase))?.SiteId == SiteContext.SiteId;

            if (isOnSiteDomain)
            {
                foreach (var subDirecotry in this.GetSubDirectorySitePaths())
                {
                    writer.WriteStartElement("sitemap", NS);
                    writer.WriteElementString("loc", NS, scheme + nakedDomain + subDirecotry + "/sitemap.xml");
                    writer.WriteEndElement();
                }
            }

            foreach (var cursorMark in cursor.CursorMarks)
            {
                writer.WriteStartElement("sitemap", NS);
                writer.WriteElementString("loc", NS,
                    prefixedDomain + "/sitemap.xml/productBatch/" + System.Web.HttpUtility.UrlPathEncode(cursorMark));
                writer.WriteEndElement();
            }

            writer.WriteEndElement();
            writer.Flush();
            return resp;
        }


        List<string> GetSubDirectorySitePaths()
        {
            var tenant = _siteBuilderContextDataProvider.GetContextData().TenantInfo;
            var site = tenant.Sites.First(x => x.Id == this.SbApiContext.SiteId);
            var ret = new List<string>();

            var routeSlug = site.Attributes?
                .Where(attr => string.Equals(attr.Name, "mozu.reverseproxy.subdirectoryrewrites"))
                .Select(attr => attr.Value)
                .FirstOrDefault() as string;

            if (routeSlug == null)
            {
                return ret;
            }

            var routeSlugPairs = System.Web.HttpUtility.ParseQueryString(routeSlug);

            foreach (string key in routeSlugPairs.Keys)
            {
                if (int.TryParse(routeSlugPairs[key], out var siteId) && siteId != this.SbApiContext.SiteId)
                {
                    var stem = key.StartsWith("/") ? key : "/" + key;
                    ret.Add(stem);
                }

            }

            return ret;
        }

        [System.Web.Http.HttpGet]
        public IActionResult Categories()
        {
            // var primaryNavTask = _gandalf.GetTreeNavigation();
            //var domainTask = GetSitePrimaryDomain();
            var nodes = _gandalf.GetFlatList();
            var domain = GetPrefixedSitePrimaryDomain();
            var resp = Ok();
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");

            // resp.Content.
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.Body);
            writer.WriteStartElement("urlset", NS);
            writer.WriteStartElement("url", NS);
            writer.WriteElementString("loc", NS, domain);
            //  writer.WriteElementString("lastmod", NS, );
            writer.WriteElementString("changefreq", NS, "daily");
            writer.WriteElementString("priority", NS, "1");
            writer.WriteEndElement();

            foreach (var node in nodes.Where(n => !n.IsHidden && !string.IsNullOrEmpty(n.Url) && !n.IsHomePage))
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
        public async Task<IActionResult> ProductBatch(string page)
        {
            var prefixDomain = GetPrefixedSitePrimaryDomain();
            var nakedDomain = GetNakedSitePrimaryDomain();
            var resp = Ok();
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");

            // resp.Content.
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.Body);
            writer.WriteStartElement("urlset", NS);

            while (true)
            {
                var prods = (await _productRuntimeWebApiClient.CloneWithoutUserClaims()
                    .CloneWithConfigOptions(cfg => cfg.TimeoutMilliseconds = 60000)
                    .GetProducts(pageSize: PageSize, 
                        cursorMark: page,
                        responseGroups: "urlonly",
                        responseFields: "items(productCode, categories, content(SEOFriendlyUrl))"))
                    .ReadAsSync();

                var vm = Mapper.Map<ProductCollection>(prods);
                vm.Init(false, PageContext.Search);
                WriteProducts(vm, writer, prefixDomain, nakedDomain, _urlHelper);
                break;
                //startIndex = startIndex + prods.PageSize;
                //if (startIndex >= (page + 1) * PageSize || startIndex >= prods.TotalCount || prods.PageCount == 0)
                //{
                //    break;
                //}
            }

            writer.WriteEndElement();
            writer.Flush();
            return resp;
        }

        [System.Web.Http.HttpGet]
        public async Task<IActionResult> Products(int page)
        {
            var prefixDomain = GetPrefixedSitePrimaryDomain();
            var nakedDomain = GetNakedSitePrimaryDomain();
            var resp = Ok();
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");

            // resp.Content.
            this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.Body);
            writer.WriteStartElement("urlset", NS);
            var startIndex = page * PageSize;

            while (true)
            {
                var prods = (await _productRuntimeWebApiClient.CloneWithoutUserClaims()
                        .CloneWithConfigOptions(cfg => cfg.TimeoutMilliseconds = 60000)
                        .GetProducts(pageSize: PageSize,
                            startIndex: startIndex,
                            responseGroups: "urlonly",
                            responseFields: "items(productCode, categories, content(SEOFriendlyUrl))"))
                        .ReadAsSync();

                var vm = Mapper.Map<ProductCollection>(prods);
                vm.Init(false, PageContext.Search);
                WriteProducts(vm, writer, prefixDomain, nakedDomain, _urlHelper);
                startIndex = startIndex + prods.PageSize;
                if (startIndex >= (page + 1) * PageSize || startIndex >= prods.TotalCount || prods.PageCount == 0)
                {
                    break;
                }

            }
            writer.WriteEndElement();
            writer.Flush();
            return resp;

        }

        private static void WriteProducts(ProductCollection vm, XmlWriter writer, string prefixedDomain, string nakedDomain, UrlHelper urlHelper)
        {

            foreach (var prod in vm.Items)
            {
                writer.WriteStartElement("url", NS);
                var url = urlHelper.MakeUrl(UrlHelper.UrlType.Product, prod, null, hostname: nakedDomain);

                writer.WriteElementString("loc", NS, url.StartsWith("/") ? prefixedDomain + url : url);
                //  writer.WriteElementString("lastmod", NS, );
                writer.WriteElementString("changefreq", NS, "daily");
                writer.WriteElementString("priority", NS, ".7");
                writer.WriteEndElement();
            }
        }


        private string GetPrefixedSitePrimaryDomain()
        {
            var primary = this.SiteContext.Domains.Primary;
            var isSslEnforced = this.SiteContext?.GeneralSettings?.EnforceSitewideSSL.GetValueOrDefault(false) == true;         
            var scheme = isSslEnforced ? "https://" : "http://";

            if (primary != null)
            {
                return scheme + primary.DomainName;
            }

            return null;
        }

        private string GetNakedSitePrimaryDomain()
        {
            var primary = SiteContext.Domains.Primary?.DomainName;
            if (Uri.TryCreate(this.PageContext.Url, UriKind.Absolute, out var uri))
            {
                if (this.SiteContext.Domains?.All.Any(domain => 
                    string.Equals(domain.DomainName, uri.Host, StringComparison.OrdinalIgnoreCase)) == false)
                {
                    return uri.Host;
                }
            }
            return primary;
        }


    }
}
