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
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.ErrorHandling;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using Mozu.SiteSettings.Application.Contracts.Clients;
using VM = Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
	[AllowAnonymous]
    [WebApi("app/capabilities", SuppressDescriptorGeneration = true)]
    public class CapabilityController : BaseController
    {
	    private readonly ICapabilitiesWebApiClient _capabilitiesWebApiClient;
	    private readonly IApplicationsWebApiClient _applicationsWebApiClient;
	    private readonly IAttributeHelper _attributeHelper;

        public CapabilityController(ICapabilitiesWebApiClient capabilitiesWebApiClient , Mozu.SiteSettings.Application.Contracts.Clients.IApplicationsWebApiClient applicationsWebApiClient )
        {
            _capabilitiesWebApiClient = capabilitiesWebApiClient;
            _applicationsWebApiClient = applicationsWebApiClient;
        }

	    [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> CapList([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
	    {
            var apps = (await _applicationsWebApiClient.GetApplications(startIndex: 0, pageSize: 600)).ReadAsSync().Items;
             
            
	        var vmApps = Mapper.Map<List<VM.Application>>(apps);



	        List<VM.Capability> list = vmApps.SelectMany(x => x.Capabilities).ToList();




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
            List<SiteSettings.Application.Contracts.Application> apps = new List<SiteSettings.Application.Contracts.Application>();
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
                    var index = app.Capabilities.FindIndex(_ => _.Id == cap.Id);
                    var editCap = app.Capabilities[index];
                    AutoMapper.Mapper.Map(cap, editCap);

                    // scope to site, if needed
                    // wut? OJP 2014.01.09 - apparently i don't have to do this any more? not sure why
                    //app.Capabilities = app.Capabilities.Where(x => x.ScopeId == editCap.ScopeId).ToList();
                    //client = _applicationsWebApiClient.CloneWithApiContext(x => x.SiteId = editCap.ScopeId);
                }
            
                // this is so bad, but we need to clean up all of capabilities / application mgmt
                try
                {
                    app = (await client.UpsertApplication(app.AppId, app)).ReadAsSync();
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
            var ret = this.List2<VM.Capability>(list);
            return this.Request.CreateResponse(HttpStatusCode.OK, ret);
        }

      
    }
}