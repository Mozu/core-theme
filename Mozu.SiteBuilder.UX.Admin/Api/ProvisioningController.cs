using System.Threading;
using AutoMapper.Impl;
using Jolt;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Behaviors;
using Mozu.Provisioning.Contracts;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.Reporting.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Client;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/provisioning", SuppressDescriptorGeneration = true)]
    public class ProvisioningController : BaseController
    {
        private readonly IProvisioningWebApiClient _provisioningWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;


        public ProvisioningController(Mozu.Provisioning.Contracts.Clients.IProvisioningWebApiClient provisioningWebApiClient, Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient)
        {
            _provisioningWebApiClient = provisioningWebApiClient;
            
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
        }
        //137
        public class ProvisionRequest{
            public int  MasterCatalogId{ get; set; }
            public string    SiteName { get; set; }
        }

        public class Provisionable
        {
            public string Name { get; set; }
            public string LocaleCode { get; set; }
            public string CurrencyCode { get; set; }
            public int Id { get; set; }
            public string ItemType { get; set; }
            public bool Expanded { get; set; }
            public List<Provisionable> Items { get; set; }
            public string Path { get; set; }
            public bool Leaf { get; set; }
            public string State { get; set; }
        }

        [HttpGetRoute(UriTemplate = "catalogs")]
        public async Task<Response<List<Provisionable>>> GetCatalogs()
        {
            var tenantInfo = (await _tenantsWebApiClient.GetTenantInternal(this.SbApiContext.TenantId, false)).ReadAsSync();
            var res = new Provisionable()
                      {
                          Path = "/",
                          Expanded = true
                      };
            res.Items = tenantInfo.MasterCatalogs.Select(mc =>
            {
                var mcNode = new Provisionable
                             {

                                 Name = mc.Name,
                                 LocaleCode = mc.DefaultLocaleCode,
                                 CurrencyCode = mc.DefaultCurrencyCode,
                                 Expanded = true,
                                 Id = mc.Id,
                                 ItemType = "mc",
                                 Path = "/"+ mc.Id ,
                                 Leaf = mc.Catalogs == null || mc.Catalogs.Count == 0,
                               
                             };
                if (mc.Catalogs != null)
                {
                    mcNode.Items = mc.Catalogs.Select(cat =>
                        new Provisionable
                        {

                            Name = cat.Name,
                            LocaleCode = cat.DefaultLocaleCode,
                            CurrencyCode = cat.DefaultCurrencyCode,
                            Expanded = false,
                            Id = cat.Id,
                            ItemType = "cat",
                            Path =  "/" + mc.Id + "/" + cat.Id ,
                            Leaf = true
                        }).ToList();
                }
                return mcNode;



            }).ToList();
            return this.List2(res.Items);


        }

        [HttpPostRoute(UriTemplate = "provisionSite")]
        public async Task<bool> Provision(SiteProvisionRequest request)
        {
            var res = await _provisioningWebApiClient.ProvisionSite(request);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();
        }

    }
}
