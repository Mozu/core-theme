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
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using VM = Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;
using Mozu.Event.Contracts.Clients;
using System.IO;
using Mozu.Core.Extensions;
using Mozu.Event.Contracts;

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
		private readonly ISubscriptionWebApiClient _eventSubscriptionWebAppClient;

		public CapabilityController(IApplicationsWebApiClient applicationsWebApiClient, ICapabilitiesWebApiClient capabilitiesWebApiClient,
		ITenantsWebApiClient tenantsWebApiClient, ISecureCapabilityConfigUrlHelper secureConfigUrlHelper, IApiContext apiContext,
		Mozu.AppDev.Contracts.Clients.IAppsWebApiClient appsWebApiClient, ISubscriptionWebApiClient eventSubscriptionWebAppClient)
		{
			_applicationsWebApiClient = applicationsWebApiClient;
			_capabilitiesWebApiClient = capabilitiesWebApiClient;
			_tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
			_secureConfigUrlHelper = secureConfigUrlHelper;
			_apiContext = apiContext;
			_appsWebApiClient = appsWebApiClient;
			_eventSubscriptionWebAppClient = eventSubscriptionWebAppClient;
		}


		[HttpPostRoute(UriTemplate = "createSecureForm")]
		public async Task<Response<SecureForm>> BulidSecureForm([FromBody]  Dictionary<string, string> body, [FromUri] string appId)
		{

			var hashKey = (await _appsWebApiClient.CloneWithoutUserClaims().GetApplicationHashkey(appId)).ReadAsSync();
			var form = _secureConfigUrlHelper.BulidSecureForm(hashKey, body);

			return this.Single2(form);
		}

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> CapList([FromUri] string id = null)
        {
            var apps = (await _applicationsWebApiClient.GetApplications(startIndex: 0, pageSize: 600)).ReadAsSync().Items;

            //todo: replace with Tasks.WhenAll...continueWith - Greg Murray on 2014-04-09
            var tenant = (await _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId)).ReadAsSync();

            var entilements = (await _tenantsWebApiClient.GetTenantEntitlements(_apiContext.TenantId)).ReadAsSync();

            var vmApps = Mapper.Map<List<VM.Application>>(apps);

            List<VM.Capability> list = vmApps.SelectMany(x => x.Capabilities).ToList();

            foreach (var capability in list)
            {
                Entitlement entitlement = entilements.Items.FirstOrDefault(x => x.AppId == capability.AppId);

                _secureConfigUrlHelper.BuildSecureUrl(capability, tenant, entitlement);
            }

            if (!string.IsNullOrEmpty(id))
            {
                list = list.Where(x => x.Id == id).ToList();
            }

            var ret = this.List2<VM.Capability>(list);

            return this.Request.CreateResponse(HttpStatusCode.OK, ret);
        }




        [HttpPostRoute(UriTemplate = "edit")]
		public async Task<HttpResponseMessage> Edit(List<VM.Capability> capabilities)
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
				catch
				{
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
				capabilities.Any(c =>
						c.Enabled.GetValueOrDefault() &&
						c.CapabilityType.Equals("TaxCalculator", StringComparison.OrdinalIgnoreCase) &&
						c.ActiveShoppingCountries != null &&
						c.ActiveShoppingCountries.Any(x => x.Equals("US", StringComparison.OrdinalIgnoreCase)));
			return this.Request.CreateResponse(HttpStatusCode.OK, result);
		}

        [HttpGetRoute(UriTemplate = "subscriptionEvents")]
        public async Task<HttpResponseMessage> SubscriptionEvents([FromUri] string AppId, [FromUri] bool forApplication, [FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection advancedSearch)
        {
            var filter = "AppId eq " + AppId + " AND subscribingtenants.tenantid eq " + _apiContext.TenantId + " AND subscribingtenants.isactive eq " + true;

            var subscriptions = (await _eventSubscriptionWebAppClient.GetSubscriptions(filter: filter)).ReadAsSync();

            if (subscriptions.Items.Count < 1)
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, subscriptions);
            }

            var subscribed = subscriptions.Items.FindAll(item => item.Topics.Count > 0 && !item.Topics.First().StartsWith("application"));
            
            if (forApplication)
            {
                subscribed = subscriptions.Items.FindAll(item => item.Topics.Count > 0 && item.Topics.First().StartsWith("application"));
            }

            var subscription = subscribed.FirstOrDefault();
            if (subscription == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, new EventDeliverySummaryCollection());
            }

            var deliveryAttempts = (await _eventSubscriptionWebAppClient.GetDeliveryAttemptSummaries(
                    subscriptionId: subscription.Id,
                    pageSize: pagingParams.pageSize ?? 20,
                    startIndex: pagingParams.startIndex ?? 0,
                    sortBy: (pagingParams.sort.Count > 0) ? pagingParams.sort.ToSortString() : "CreateDate desc",
                    filter: advancedSearch.ToFilterString()
                )).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, deliveryAttempts);
		}

        [HttpGetRoute(UriTemplate = "subscribingInfo")]
        public async Task<HttpResponseMessage> SubscribingInfo([FromUri] string AppId, [FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection advancedSearch)
        {
            var filter = "AppId eq " + AppId + " AND subscribingtenants.tenantid eq " + _apiContext.TenantId;
            var subscriptions = (await _eventSubscriptionWebAppClient.GetSubscriptions(pageSize: 200, startIndex: 0,filter: filter)).ReadAsSync();

            var resultCollection = getTenantSubscription(subscriptions.Items);


            return this.Request.CreateResponse(HttpStatusCode.OK, resultCollection);
		}

        private List<Event.Contracts.Subscription> getTenantSubscription(List<Event.Contracts.Subscription> subscriptions)
        {
            var resultCollection = new List<Event.Contracts.Subscription>();

            subscriptions.ForEach(
                (sub) =>
                {
                    var tenantCall = _eventSubscriptionWebAppClient.GetSubscribingTenant(sub.Id, _apiContext.TenantId);
                    tenantCall.Wait();

                    if (!tenantCall.Result.HasException)
                    {
                        var tenantSub = tenantCall.Result.ReadAsSync();
                        sub.IsActive = tenantSub.IsActive;
                        resultCollection.Add(sub);
                    }


                }
            );

            return resultCollection;
        }

        [HttpGetRoute(UriTemplate = "export")]
        public async Task<CapabilityCsvFileResult> Export([FromUri] string AppId, [FromUri] FilterCollection advancedSearch)
        {
            var filter = "AppId eq " + AppId;
            var subscriptions = (await _eventSubscriptionWebAppClient.GetSubscriptions(filter: filter)).ReadAsSync();

            var resultCollection = new List<Event.Contracts.EventDeliverySummaryCollection>();

            var totalDeliveryAttempts = 0;

            var results = new Event.Contracts.EventDeliverySummaryCollection() { Items = new List<Event.Contracts.EventDeliverySummary>() };

            Task[] deliveryAttempts = subscriptions.Items.Select(sub => _eventSubscriptionWebAppClient.GetDeliveryAttemptSummaries(
              sub.Id,
              filter: advancedSearch.ToFilterString()
              ).ContinueWith(item => resultCollection.Add(item.Result.ReadAsSync()))).ToArray();


            //subscriptions.Items.ForEach(
            //      item =>
            //      {
            //        results.Items.Add(item);
            //        results.TotalCount = results.TotalCount + 1;
            //      });


            await Task.WhenAll(deliveryAttempts);

            
            

            results.Items.Sort((x, y) => y.LastExecutionDate.CompareTo(x.LastExecutionDate));
            //results.Items.RemoveRange(pageSize, results.Items.Count - pageSize);

            var ms = new MemoryStream();
            var sw = new StreamWriter(ms);
            return new CapabilityCsvFileResult("text/csv")
            {
                FileDownloadName = "application_events_export.csv",
                EventCollection = results

            };
        }

        private async Task<Event.Contracts.EventDeliverySummaryCollection> getAllEventDeliverySummaries(string subscriptionId, FilterCollection extFilter, Event.Contracts.EventDeliverySummaryCollection accum, int pageSize = 500, int startIndex = 0)
        {
           
            var results = new Event.Contracts.EventDeliverySummaryCollection();
            var deliveryAttempts = new Event.Contracts.EventDeliverySummaryCollection() { Items = new List<Event.Contracts.EventDeliverySummary>() };

            if (startIndex < accum.TotalCount) {
                deliveryAttempts = (await _eventSubscriptionWebAppClient.GetDeliveryAttemptSummaries(
                   subscriptionId,
                   pageSize: pageSize,
                   startIndex: startIndex,
                   sortBy: "CreateDate asc",
                   filter: extFilter.ToFilterString()
               )).ReadAsSync();
            }

            accum.Items.AddRange(deliveryAttempts.Items);

            if(accum.Items.Count >= accum.TotalCount)
            {
                await getAllEventDeliverySummaries(subscriptionId, extFilter, accum, accum.PageSize, accum.Items.Count - 1);
            }
            return accum;
        }

        public class CapabilityCsvFileResult : Mozu.SiteBuilder.Mvc.ActionResults.FileResult
        {
            public CapabilityCsvFileResult(string contentType) : base(contentType)
            {
            }
            public Event.Contracts.EventDeliverySummaryCollection EventCollection { get; set; }
            protected override void WriteFile(System.Web.HttpResponseBase response)
            {
                var sw = response.Output;
                sw.WriteLine("Create Date,Delivery Status,Topic,Tenant Id,Site Id,Event Id");
               EventCollection.Items.ForEach(x =>
                {
                    sw.Write(x.CreateDate);
                    sw.Write(',');
                    sw.Write(x.DeliveryStatus);
                    sw.Write(',');
                    sw.Write(x.EventSummary.Topic);
                    sw.Write(',');
                    sw.Write(x.EventSummary.TenantId);
                    sw.Write(',');
                    sw.Write(x.EventSummary.SiteId);
                    sw.Write(',');
                    sw.Write(x.EventSummary.EventId);
                    sw.WriteLine();

                    x.DeliveryAttempts.Each(attempt =>
                    {
                        sw.Write("");
                        sw.Write(',');

                        sw.Write(attempt.DeliveryStatus);
                        sw.Write(',');
                        sw.Write(attempt.HttpStatus);
                        sw.Write(',');
                        CapabilityController.EscapeWrite(sw, attempt.Message);
                        sw.Write(',');
                        sw.Write(attempt.ExecutionDate);
                        sw.WriteLine();
                    });
                    sw.WriteLine();
                });

            }
            protected override Task WriteFileAsync(System.Web.HttpResponseBase response)
            {
                WriteFile(response);
                return Task.FromResult<bool>(true);
            }
        }

        static void EscapeWrite(TextWriter sw, string inSTr)
        {
            if (inSTr.IndexOf('\"') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr.Replace("\"", "\"\""));
                sw.Write('\"');


            }
            else if (inSTr.IndexOf('\"') > -1 || inSTr.IndexOf(',') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr);
                sw.Write('\"');

            }
            else
            {
                sw.Write(inSTr);
            }

        }
    }
}