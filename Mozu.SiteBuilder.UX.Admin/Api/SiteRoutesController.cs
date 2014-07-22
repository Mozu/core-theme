using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using AutoMapper;
using FiftyOne.Foundation.Mobile.Detection.Matchers;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
     [WebApi("app/siteroutes", SuppressDescriptorGeneration = true)]
    public  class SiteRoutesController : BaseController
  
    {
         private readonly ISiteRouteRepository _siteRouteRepository;

         public SiteRoutesController(ISiteRouteRepository siteRouteRepository)
         {
             _siteRouteRepository = siteRouteRepository;
         }
        //
        // GET: /Redirect/

         [HttpGetRoute(UriTemplate = "list")]
         public async Task<Response<List<SiteRouteEntry>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] bool draft = false)
         {
             var list = await _siteRouteRepository.FetchSiteRouteEntries();


             for (int i = 0; i < list.Count; i++)
             {
                 list[i].Index = i;
             }

             return this.List2(list);
         }

         [HttpPostRoute(UriTemplate = "create")]
         public async Task<Response<List<SiteRouteEntry>>> Create(List<SiteRouteEntry> redirects)
         {
             return await Edit(redirects);

         }

         [HttpPostRoute(UriTemplate = "edit")]
         public async Task<Response<List<SiteRouteEntry>>> Edit(List<SiteRouteEntry> redirects)
         {
             var list = await _siteRouteRepository.FetchSiteRouteEntries();


             redirects.ForEach(x =>
             {
                 if (string.IsNullOrEmpty(x.Name))
                 {
                     x.Name = Guid.NewGuid().ToString();
                     x.Index = x.Index.GetValueOrDefault(1000);
                     list.Add(x);
                 }
                 else
                 {
                     list[list.FindIndex(y => y.Name == x.Name)] = x;
                 }
             });


             

             list=list.OrderBy(x => x.Index.GetValueOrDefault(1000)).ToList();

             for (int i = 0;i<list.Count ;i++ )
             {
                 list[i].Index = i;
             }
             await _siteRouteRepository.UpdateRedirectEntries(list);

             return this.List2(redirects);
         }

         [HttpPostRoute(UriTemplate = "delete")]
         public async Task<Response<List<SiteRouteEntry>>> Delete(List<SiteRouteEntry> redirects)
         {
             var list = await _siteRouteRepository.FetchSiteRouteEntries();

             list = list.Where(x => !redirects.Any(y => y.Name == x.Name)).ToList();

             list = list.OrderBy(x => x.Index.GetValueOrDefault(1000)).ToList();

             for (int i = 0; i < list.Count; i++)
             {
                 list[i].Index = i;
             }
             await _siteRouteRepository.UpdateRedirectEntries(list);
             return this.List2(redirects);
         }


    }
}
