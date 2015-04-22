using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.Provisioning.Contracts;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Constants = Mozu.Tenant.Contracts.Constants;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/provisioning", SuppressDescriptorGeneration = true)]
    public class ProvisioningController : BaseController
    {
        private readonly IProvisioningWebApiClient _provisioningWebApiClient;
        private readonly ITenantsWebApiClient _systemTenantsWebApiClient;
        private readonly ITenantsWebApiClient _userTenantsWebApiClient;


        public ProvisioningController(IProvisioningWebApiClient provisioningWebApiClient, ITenantsWebApiClient tenantsWebApiClient)
        {
            _provisioningWebApiClient = provisioningWebApiClient;
            _systemTenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _userTenantsWebApiClient = tenantsWebApiClient;
        }
        
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
        public async Task<Response<List<Site>>> GetSites()
        {
            var tenantInfo = (await _systemTenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId, false)).ReadAsSync();
            var activeMcs = tenantInfo.MasterCatalogs.Where(IsActive);
            var activeMCIds = activeMcs.Select(Id<BaseTenantEntityInternal, int>).ToArray();
            var activeCatIds = activeMcs.SelectMany(x => x.Catalogs).Where(IsActive).Select(Id<BaseTenantEntityInternal, int>).ToArray();
            var activeSites = tenantInfo.Sites.Where(x => activeMCIds.Contains(x.MasterCatalogId.GetValueOrDefault()) && activeCatIds.Contains(x.CatalogId.GetValueOrDefault())).ToList();
            return List2(activeSites);
        }

        [HttpGetRoute(UriTemplate = "catalogs")]
        public async Task<Response<List<Provisionable>>> GetCatalogs()
        {
            var tenantInfo = (await _systemTenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId, false)).ReadAsSync();
            var res = new Provisionable
            {
                Path = "/",
                Expanded = true,
                Items = tenantInfo.MasterCatalogs.Where(IsActive).Select(mc =>
                {
                    var mcNode = new Provisionable
                    {
                        Name = mc.Name,
                        DefaultLocaleCode = mc.DefaultLocaleCode,
                        DefaultCurrencyCode = mc.DefaultCurrencyCode,
                        Expanded = true,
                        Id = mc.Id,
                        ItemType = "mastercatalog",
                        Path = "/" + mc.Id,
                        Status = mc.Status,
                        Leaf = mc.Catalogs == null || mc.Catalogs.Count == 0,
                    };
                    if (mc.Catalogs != null)
                    {
                        mcNode.Items = mc.Catalogs.Where(IsActive).Select(cat =>
                            new Provisionable
                            {
                                Name = cat.Name,
                                MasterCatalogId = cat.MasterCatalogId,
                                DefaultLocaleCode = cat.DefaultLocaleCode,
                                DefaultCurrencyCode = cat.DefaultCurrencyCode,
                                Expanded = false,
                                Id = cat.Id,
                                Status = mc.Status,
                                ItemType = "catalog",
                                Path = "/" + mc.Id + "/" + cat.Id,
                                Leaf = true
                            }).ToList();
                    }
                    return mcNode;
                }).ToList()
            };
            return List2(res.Items);
        }

        private static bool IsActive<T>(T entity) where T : BaseTenantEntityInternal
        {
            return entity.Status.EqualsIgnoreCase(Constants.TenantProvisioningState.ACTIVE) && !entity.IsDeleted;
        }

        private static TId Id<T, TId>(T entity) where T : IIdentifiable<TId>
        {
            return entity.Id;
        }

        [HttpPostRoute(UriTemplate = "RenameEntity")]
        public async Task<bool> RenameEntity(Provisionable entity)
        {
            var tenant = (await _systemTenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId)).ReadAsSync();
        
            if (entity.ItemType == "site")
            {
                var site = tenant.Sites.First(x => x.Id == entity.Id);
                site.Name = entity.Name;
                var res = await _userTenantsWebApiClient.UpdateSite(SbApiContext.TenantId, entity.Id, site);
                

             

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
                var res = await _userTenantsWebApiClient.UpdateCatalog(this.SbApiContext.TenantId, entity.Id, catalog);

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
                var res = await _userTenantsWebApiClient.UpdateMasterCatalog(this.SbApiContext.TenantId, entity.Id, catalog);

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
        public async Task<HttpResponseMessage> ProvisionSite(SiteProvisionRequest request)
        {
            var res = (await _provisioningWebApiClient.ProvisionSite(request)).ReadAsSync();
            return this.Request.CreateResponse(new CommitRequest()
            {
                MasterCatalogId = res.MasterCatalogId ,
                CatalogId =res.CatalogId ,
                SiteId  = res.Id,
                Type = "site"
            });
        }

      
        [HttpPostRoute(UriTemplate = "provisionCatalog")]
        public async Task<HttpResponseMessage> ProvisionCatalog(CatalogProvisionRequest request)
        {
            var res = (await _provisioningWebApiClient.ProvisionCatalog(request)).ReadAsSync();
            return this.Request.CreateResponse(new CommitRequest()
            {
                MasterCatalogId = res.MasterCatalogId ,
                CatalogId =res.Id ,
                Type = "catalog"
            });

        }

        [HttpPostRoute(UriTemplate = "provisionMasterCatalog")]
        public async Task<HttpResponseMessage> ProvisionMasterCatalog(MasterCatalogProvisionRequest request)
        {

            var res = (await _provisioningWebApiClient.ProvisionMasterCatalog(request)).ReadAsSync();

            return this.Request.CreateResponse(new CommitRequest()
                                               {
                                                   MasterCatalogId =res.Id,
                                                   Type = "mastercatalog"
                                               });
            //return res;


        }

        public class CommitRequest
        {
            public string Type { get; set; }
            public int? CatalogId { get; set; }
            public int? MasterCatalogId { get; set; }
            public int? SiteId { get; set; }

        }

        [HttpPostRoute(UriTemplate = "provisionCommit")]
        public async Task<HttpResponseMessage> CommitProvisioning(CommitRequest  request)
        {
            
            int tenantId = this.SbApiContext.TenantId;
            if (request.Type == "site")
            {
                var res = await _provisioningWebApiClient.FinishSite(tenantId, request.SiteId);
                if (!res.ResponseMessage.IsSuccessStatusCode)
                {
                    throw res.ReadException();
                }
            }
            if (request.Type == "catalog")
            {
                var res = await _provisioningWebApiClient.FinishCatalog(tenantId, request.CatalogId);
                if (!res.ResponseMessage.IsSuccessStatusCode)
                {
                    throw res.ReadException();
                }
            }
            if (request.Type == "mastercatalog")
            {
                var res = await _provisioningWebApiClient.FinishMasterCatalog(tenantId, request.MasterCatalogId);
                if (!res.ResponseMessage.IsSuccessStatusCode)
                {
                    throw res.ReadException();
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.OK);
            //return res;


        }

       
     

       
    }
}
