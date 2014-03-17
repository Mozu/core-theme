using System;
using System.Threading;
using AutoMapper.Impl;
using Jolt;
using Mozu.Core.Api.Contracts.Client;
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
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;


        public ProvisioningController(Mozu.Provisioning.Contracts.Clients.IProvisioningWebApiClient provisioningWebApiClient, Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient, Mozu.Tenant.Contracts.Clients.ISitesWebApiClient sitesWebApiClient )
        {
            _provisioningWebApiClient = provisioningWebApiClient;
            _sitesWebApiClient = sitesWebApiClient;

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
            public string DefaultLocaleCode { get; set; }
            public string DefaultCurrencyCode { get; set; }
            public int Id { get; set; }
            public string ItemType { get; set; }
            public bool Expanded { get; set; }
            public List<Provisionable> Items { get; set; }
            public string Path { get; set; }
            public bool Leaf { get; set; }
            public string Status { get; set; }

            public int MasterCatalogId { get; set; }
        }


        [HttpGetRoute(UriTemplate = "sites")]
        public async Task<Response<List<Mozu.Tenant.Contracts.Site >>> GetSites()
        {
          
            var tenantInfo = (await _tenantsWebApiClient.GetTenantInternal(this.SbApiContext.TenantId, false)).ReadAsSync();
            var sites = tenantInfo.Sites;
            return this.List2(sites);
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
                                 DefaultLocaleCode = mc.DefaultLocaleCode,
                                 DefaultCurrencyCode = mc.DefaultCurrencyCode,
                                 Expanded = true,
                                 Id = mc.Id,
                                 ItemType = "mastercatalog",
                                 Path = "/"+ mc.Id ,
                                 Status = mc.Status ,
                                 Leaf = mc.Catalogs == null || mc.Catalogs.Count == 0,
                               
                             };
                if (mc.Catalogs != null)
                {
                    mcNode.Items = mc.Catalogs.Select(cat =>
                        new Provisionable
                        {

                            Name = cat.Name,
                            MasterCatalogId = cat.MasterCatalogId ,
                            DefaultLocaleCode = cat.DefaultLocaleCode,
                            DefaultCurrencyCode = cat.DefaultCurrencyCode,
                            Expanded = false,
                            Id = cat.Id,
                            Status = mc.Status,
                            ItemType = "catalog",
                            Path =  "/" + mc.Id + "/" + cat.Id ,
                            Leaf = true
                        }).ToList();
                }
                return mcNode;



            }).ToList();
            return this.List2(res.Items);


        }

        [HttpPostRoute(UriTemplate = "RenameEntity")]
        public async Task<bool> RenameEntity(Provisionable entity)
        {
            var tenant = (await _tenantsWebApiClient.GetTenantInternal(this.SbApiContext.TenantId)).ReadAsSync();
        
            if (entity.ItemType == "site")
            {
                var site = tenant.Sites.First(x => x.Id == entity.Id);
                site.Name = entity.Name;
                var res = await _tenantsWebApiClient.UpdateSite(this.SbApiContext.TenantId, entity.Id, site);
                

             

                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    return true;
                }
                throw res.ReadException();

            }
            if (entity.ItemType == "catalog")
            {
                var catalog = tenant.MasterCatalogs.SelectMany(x => x.Catalogs).First(x => x.Id == entity.Id);
                catalog.Name = entity.Name;
                var res = await _tenantsWebApiClient.UpdateCatalog(this.SbApiContext.TenantId, entity.Id, catalog);

                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    return true;
                }
                throw res.ReadException();
            }
            if (entity.ItemType == "mastercatalog")
            {
                var catalog = tenant.MasterCatalogs.First(x => x.Id == entity.Id);
                catalog.Name = entity.Name;
                var res = await _tenantsWebApiClient.UpdateMasterCatalog(this.SbApiContext.TenantId, entity.Id, catalog);

                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    return true;
                }
                throw res.ReadException();
            }
            throw new NotImplementedException();

        }

        [HttpPostRoute(UriTemplate = "deleteEntity")]
        public async Task<bool> DeleteEntity( Provisionable entity)
        {
            
            ServiceClientResponse<StreamContent> res = null;
            if (entity.ItemType == "site")
            {
                res = await _provisioningWebApiClient.SoftDeleteSite(this.SbApiContext.TenantId, entity.Id );    
            }
            if (entity.ItemType == "catalog")
            {
                res = await _provisioningWebApiClient.SoftDeleteCatalog(  catalogId : entity.Id, masterCatalogId : entity.MasterCatalogId, tenantId : this.SbApiContext.TenantId );
            }
            if (entity.ItemType == "mastercatalog")
            {
                res = await _provisioningWebApiClient.SoftDeleteMasterCatalog(this.SbApiContext.TenantId, entity.Id);
            }

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();
        }

        [HttpPostRoute(UriTemplate = "provisionSite")]
        public async Task<bool> ProvisionSite(SiteProvisionRequest request)
        {
            var res = await _provisioningWebApiClient.ProvisionSite(request);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();
        }

      
        [HttpPostRoute(UriTemplate = "provisionCatalog")]
        public async Task<bool> ProvisionCatalog(CatalogProvisionRequest request)
        {
            var res = await _provisioningWebApiClient.ProvisionCatalog(request);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();
        }

        [HttpPostRoute(UriTemplate = "provisionMasterCatalog")]
        public async Task<bool> ProvisionMasterCatalog(MasterCatalogProvisionRequest request)
        {

            var res = await _provisioningWebApiClient.ProvisionMasterCatalog(request);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();


        }

     

       
    }
}
