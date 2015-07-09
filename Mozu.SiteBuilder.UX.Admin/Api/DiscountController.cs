using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using System.Globalization;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;
using Mozu.SiteBuilder.UX.Admin.Helpers.DiscountHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts.Client;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for discounts.
	/// </summary>
    [WebApi("app/discount", SuppressDescriptorGeneration = true)]
    public class DiscountController : BaseController
    {
        private readonly IDiscountWebApiClient _discountWebClient;
        private readonly IDiscountSortFormatter _discountSortFormatter;
        private IApiContext _ctx;
        private readonly ITenantsWebApiClient _tenantClient;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public DiscountController(IDiscountWebApiClient discountWebClient, IDiscountSortFormatter discountSortFormatter, IApiContext ctx, ITenantsWebApiClient tenantClient, ICheckoutSettingsWebApiClient checkoutSettingsClient)
        {
            _discountWebClient = discountWebClient;
            _discountSortFormatter = discountSortFormatter;
            _ctx = ctx;
            _tenantClient = tenantClient;
            _checkoutSettingsClient = checkoutSettingsClient;

        }

        /// <summary>
        /// Get a list of discounts.
        /// </summary>
		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Discount>>> ListDiscounts(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var singleDiscount = (await _discountWebClient.GetDiscount(pagingParams.NumericId)).ReadAsSync();

                return List2(Mapper.Map<Discount>(singleDiscount));
            }

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                var tenant = (await _tenantClient.GetTenant(_ctx.TenantId)).ReadAsSync();
                var masterCat = tenant.MasterCatalogs.FirstOrDefault(x => x.Id == _ctx.MasterCatalogId);
                var defaultLocalCode = masterCat.DefaultLocaleCode;
                var masterNumberFormat = CultureInfo.GetCultureInfo(defaultLocalCode).NumberFormat;

                filter = extFilter.ToFilterString(_ctx, masterNumberFormat, _tenantClient);
            }
            

            string sortBy = pagingParams.ToSort(_discountSortFormatter);

            try
            {
                var discountList = (await _discountWebClient.GetDiscounts(pagingParams.startIndex, pagingParams.pageSize, sortBy, filter, null)).ReadAsSync();

                var discounts = Mapper.Map<List<Discount>>(discountList.Items);

                return List2(discounts, (int?)discountList.TotalCount );
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<Discount>(e.Message);
            }
        }

        /// <summary>
        /// Create a new discount.
        /// </summary>
		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Discount>>> CreateDiscount(List<Discount> discounts)
        {
            var responseList = new List<Discount>();


            foreach (var discount in discounts)
            {
                var dc = Mapper.Map<DC.Discount>(discount);

                // the Mozu service does not accept a null StartDate, even though the field is nullable.
                // TODO: this may be fixed in the future on their end.
                if (dc.Conditions.StartDate  == null)
                    dc.Conditions.StartDate = DateTime.UtcNow;

                // the Mozu service does not allow us to pick "FreeShipping" but have no shipping methods associated.
                if (dc.Target.Type == "FreeShipping" && (dc.Target.ShippingMethods == null || dc.Target.ShippingMethods.Count == 0))
                {
                    var meth = new DC.TargetedShippingMethod { Code = "FreeShipping", Name = "Free Shipping" };
                    dc.Target.ShippingMethods = new List<DC.TargetedShippingMethod>(new[] { meth });
                }

                try
                {
                    var response = (await _discountWebClient.CreateDiscount(dc)).ReadAsSync();
                    responseList.Add(Mapper.Map<Discount>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return this.FailureList2<Discount>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing discount.
        /// </summary>
		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<Discount>>> EditDiscount(List<Discount> discountList, int? id = null)
        {
            var retList = new List<Discount>();

            foreach (var discount in discountList)
            {
                var dc = Mapper.Map<DC.Discount>(discount);
                var res = (await _discountWebClient.UpdateDiscount(dc, discount.Id )).ReadAsSync();
                retList.Add(Mapper.Map<Discount>(res));
            }

            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<Discount>> DeleteDiscount(List<Discount> discounts)
        {
            var tasks = discounts.Select(d => _discountWebClient.DeleteDiscount(d.Id)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<Discount>(discounts.Count);
        }

        [HttpGetRoute(UriTemplate = "paymentworkflow/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetPaymentWorkflows(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var displayNames = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("PAYPALEXPRESS", "PayPal Express"),
                new KeyValuePair<string, string>("VISAPAY", "Visa Pay"),
                new KeyValuePair<string, string>("AMAZONPAY", "Amazon Pay"),

            };
            var paymentSettings = (await _checkoutSettingsClient.GetPaymentSettings()).ReadAsSync();

            var enabledPaymentWorkflows = ( from wk in paymentSettings.ExternalPaymentWorkflowDefinitions
                                            join dis in displayNames on wk.Name equals dis.Key
                                            where wk.IsEnabled
                                            select new KeyValuePair<string, string>(wk.Name, dis.Value)
                                           ).ToList();
            //move to front end.
            enabledPaymentWorkflows.Insert(0, new KeyValuePair<string, string>("None", "None"));
            return List2(enabledPaymentWorkflows);
        }
    }
}