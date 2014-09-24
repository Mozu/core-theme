using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Xml.Linq;
using AutoMapper;
using Magnum.Extensions;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Navigation;
using System.Xml;
using System.IO;
using System.Text;
using Mozu.SiteBuilder.Mvc;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class SitemapController : BaseApiController
    {
        INavigationRepository _nav;
    
        private readonly ISitesWebApiClient _sitesWebApi;

        private readonly IProductRuntimeWebApiClient _productSearchWebApiClient;
        private INavigationGandalf _gandalf;
        private const int PageSize = 2000;
        const string NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
        public SitemapController(INavigationRepository navigationRepository,ISitesWebApiClient sitesWebApiClient , INavigationGandalf gandalf,  Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient productSearchWebApiClient)
        {
            _nav = navigationRepository;
            _gandalf = gandalf;

            _sitesWebApi = sitesWebApiClient;
            _productSearchWebApiClient = productSearchWebApiClient;
            
        }

           [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> Index()
        {

            var prods = (await _productSearchWebApiClient.GetProducts( pageSize: 0)).ReadAsSync();
            var resp = this.Request.CreateResponse(HttpStatusCode.OK);
            int pages = (int)Math.Ceiling((decimal)prods.TotalCount/(decimal)PageSize);
            var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
            var domain = GetSitePrimaryDomain();
         
               this.HttpContext.Response.ContentType = "text/xml";
            var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
            writer.WriteStartElement("sitemapindex", NS);

            writer.WriteStartElement("sitemap", NS);
            writer.WriteElementString("loc", NS, domain + "/sitemap.xml/categories");
            writer.WriteEndElement();


            for (int i = 0; i < pages; i++)
            {
                writer.WriteStartElement("sitemap", NS);
                writer.WriteElementString("loc", NS, domain + "/sitemap.xml/products/" + i);
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


               var domain =  GetSitePrimaryDomain();
               var resp = this.Request.CreateResponse(HttpStatusCode.OK);

               var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
               // resp.Content.
               this.HttpContext.Response.ContentType = "text/xml";
               var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
               writer.WriteStartElement("urlset", NS);


               writer.WriteStartElement("url", NS);
               writer.WriteElementString("loc", NS,  domain );
               //  writer.WriteElementString("lastmod", NS, );
               writer.WriteElementString("changefreq", NS, "daily");
               writer.WriteElementString("priority", NS, "1");
               writer.WriteEndElement();

               foreach ( var node in nodes.Where(x=> !x.IsHidden && !string.IsNullOrEmpty(x.Url) ))
               {
                   writer.WriteStartElement("url", NS);
                   writer.WriteElementString("loc", NS, node.Url.StartsWith("/") ?  domain + node.Url : node.Url );
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
               var domain =  GetSitePrimaryDomain();
               
               var resp = this.Request.CreateResponse(HttpStatusCode.OK);
               var date = DateTime.UtcNow.AddDays(1).Date.ToString("o");
               // resp.Content.
               this.HttpContext.Response.ContentType = "text/xml";
               var writer = XmlTextWriter.Create(this.HttpContext.Response.OutputStream);
               writer.WriteStartElement("urlset", NS);
             int offset = 0;
             var startIndex = page*PageSize;
             while (true)
             {

                 var prods = (await _productSearchWebApiClient.CloneWithoutUserClaims().GetProducts(pageSize: PageSize, startIndex: startIndex, responseGroups:"urlonly",  responseFields: "items(productCode, content(SEOFriendlyUrl))")).ReadAsSync();

                 

                 var vm = Mapper.Map<List<Product>>(prods.Items);
                 WriteProducts(vm, writer, domain);
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

        private static void WriteProducts(List<Product> vm, XmlWriter writer, string domain)
        {
            foreach (var prod in vm)
            {
                writer.WriteStartElement("url", NS);
                writer.WriteElementString("loc", NS, domain + prod.Url);
                //  writer.WriteElementString("lastmod", NS, );
                writer.WriteElementString("changefreq", NS, "daily");
                writer.WriteElementString("priority", NS, ".7");
                writer.WriteEndElement();
            }
        }


        private string GetSitePrimaryDomain()
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

    }
}
