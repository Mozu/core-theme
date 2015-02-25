using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.AppDev.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.ErrorHandling;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using Mozu.InstalledApplications.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Helpers.SecurityHelpers;
using Mozu.Tenant.Contracts.Clients;
using VM = Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
	[AllowAnonymous]
    [WebApi("app/capabilities", SuppressDescriptorGeneration = true)]
    public class CapabilityController : BaseController
    {
        private readonly IApplicationsWebApiClient _applicationsWebApiClient;
        private readonly ICapabilitiesWebApiClient _capabilitiesWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly ISecureCapabilityConfigUrlHelper _secureConfigUrlHelper;
        private readonly IApiContext _apiContext;
	    private readonly IAppsWebApiClient _appsWebApiClient;

	    public CapabilityController(IApplicationsWebApiClient applicationsWebApiClient, ICapabilitiesWebApiClient capabilitiesWebApiClient, ITenantsWebApiClient tenantsWebApiClient, ISecureCapabilityConfigUrlHelper secureConfigUrlHelper, IApiContext apiContext , Mozu.AppDev.Contracts.Clients.IAppsWebApiClient  appsWebApiClient )
        {
            _applicationsWebApiClient = applicationsWebApiClient;
            _capabilitiesWebApiClient = capabilitiesWebApiClient;
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _secureConfigUrlHelper = secureConfigUrlHelper;
            _apiContext = apiContext;
            _appsWebApiClient = appsWebApiClient;
        }


	    [HttpPostRoute(UriTemplate = "createSecureForm")]
        public async Task<Response<SecureForm>> BulidSecureForm([FromBody]  Dictionary<string, string> body, [FromUri] string appId)
	    {

	        var hashKey = (await _appsWebApiClient.CloneWithoutUserClaims().GetApplicationHashkey(appId)).ReadAsSync();
            var form = _secureConfigUrlHelper.BulidSecureForm(hashKey, body);

            return this.Single2(form);
	    }

	    [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> CapList([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
	    {
            var apps = (await _applicationsWebApiClient.GetApplications(startIndex: 0, pageSize: 600)).ReadAsSync().Items;
            
            //todo: replace with Tasks.WhenAll...continueWith - Greg Murray on 2014-04-09
            var tenant = (await _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId)).ReadAsSync();

            #region test
            //var appsTask = _applicationsWebApiClient.GetApplications(startIndex: 0, pageSize: 600);
            //var tenantTask = _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId);

            //try
            //{
            //    await Task.WhenAll(appsTask, tenantTask);
            //}
            //catch (Exception e)
            //{
            //    Console.WriteLine(e);
            //}

            //var appsM = (await appsTask).ReadAsSync().Items;
            //var tenantM = (await tenantTask).ReadAsSync();

            #endregion

            var vmApps = Mapper.Map<List<VM.Application>>(apps);

	        List<VM.Capability> list = vmApps.SelectMany(x => x.Capabilities).ToList();

            foreach (var capability in list)
            {
                _secureConfigUrlHelper.BuildSecureUrl(capability, tenant);
            }

            if (pagingParams != null && !string.IsNullOrEmpty(pagingParams.id))
            {
                list = list.Where(x => x.Id == pagingParams.id).ToList();
            }

	        var ret = this.List2<VM.Capability>(list);

	        return this.Request.CreateResponse(HttpStatusCode.OK , ret );
	    }

       
        

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage>  Edit(List<VM.Capability >capabilities )
        {
            var apps = new List<InstalledApplications.Contracts.Internal.Application>();
            foreach (var cap in capabilities)
            {
                var app = (await _applicationsWebApiClient.GetApplication(cap.AppId)).ReadAsSync();
                var client = _applicationsWebApiClient;

                if (cap.AppId == cap.Id)
                {
                    // gosh this is awful, but need to do this to support Extensions w/o refactoring a bunch of stuff
                    app.Enabled = cap.Enabled;
                }
                else
                {
                    var editCap = app.Capabilities.FirstOrDefault(x => x.Id == cap.Id);
                    if (editCap == null)
                        throw new VaeItemNotFoundException(string.Format("Could not find capability {0}", cap.Id));

                    AutoMapper.Mapper.Map(cap, editCap);

                    if (cap.Enabled.GetValueOrDefault())
                    {
                        app.Enabled = true;
                    }
                    else
                    {
                        var enabledCount = app.Capabilities.Count(x => x.Enabled.GetValueOrDefault());
                        app.Enabled = (enabledCount > 0);
                    }              
                    // scope to site, if needed
                    // wut? OJP 2014.01.09 - apparently i don't have to do this any more? not sure why
                    //app.Capabilities = app.Capabilities.Where(x => x.ScopeId == editCap.ScopeId).ToList();
                    //client = _applicationsWebApiClient.CloneWithApiContext(x => x.SiteId = editCap.ScopeId);
                }
            
                // this is so bad, but we need to clean up all of capabilities / application mgmt
                try
                {
                    
                    app = (await client.UpdateApplication(app.AppId, app)).ReadAsSync();
                }
                catch {
                    app = null;
                }
                if (app == null)
                {
                    app = (await _applicationsWebApiClient.GetApplication(cap.AppId)).ReadAsSync();
                }
                apps.Add(app);
            }

            var vmApps = Mapper.Map<List<VM.Application>>(apps);
            List<VM.Capability> list = vmApps.SelectMany(x => x.Capabilities).ToList();

            var tenant = (await _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId)).ReadAsSync();
            foreach (var cap in list)
            {
                _secureConfigUrlHelper.BuildSecureUrl(cap, tenant);
            }

            var ret = this.List2<VM.Capability>(list);
            return this.Request.CreateResponse(HttpStatusCode.OK, ret);
        }

        /**
           * This checks to see if we have a tax capability enabled on this tenant for US.
           */
        [HttpGetRoute(UriTemplate = "checktaxcapability")]
        public async Task<HttpResponseMessage> CheckForTax()
        {
            var capabilities = (await _capabilitiesWebApiClient.GetCapabilities()).ReadAsSync();
            var result =
                capabilities.Any(
                    c =>
                        c.Enabled.GetValueOrDefault() &&
                        c.CapabilityType.Equals("TaxCalculator", StringComparison.OrdinalIgnoreCase) &&
                        c.ActiveShoppingCountries != null &&
                        c.ActiveShoppingCountries.Any(x => x.Equals("US", StringComparison.OrdinalIgnoreCase)));
            return this.Request.CreateResponse(HttpStatusCode.OK, result);
        }
    }
}