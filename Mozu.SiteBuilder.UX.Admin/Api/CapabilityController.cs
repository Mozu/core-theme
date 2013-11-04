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



	        List<VM.Capability> list = vmApps.SelectMany(x => x.Crapabilities).ToList();

	        var ret = this.List2<VM.Capability>(list);


	        return this.Request.CreateResponse(HttpStatusCode.Found, ret,  LowerCaseJsonMediaTypeFormatter.Default );


	    }

       
        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage>  Edit(List<VM.Capability >capabilities )
        {
            foreach (var cap in capabilities)
            {
                var app = (await _applicationsWebApiClient.GetApplication(cap.AppId)).ReadAsSync();

                var index = app.Capabilities.FindIndex(_ => _.CapabilityType == cap.CapabilityType);

               // var newDmCap = Mapper.Map<Mozu.Core.ThirdParty.Contracts.Capability>(cap);


                app.Capabilities[index].Enabled = cap.Enabled;
                //todo other stuff
                _applicationsWebApiClient.UpsertApplication(app.AppId, app).Wait();
            }
            return await this.CapList(null, null);
        }

      
    }
}