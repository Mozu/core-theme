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
using Mozu.Core.Extensions;
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
        private readonly ICouponSetWebApiClient _couponSetClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public DiscountController(IDiscountWebApiClient discountWebClient, IDiscountSortFormatter discountSortFormatter, IApiContext ctx, ITenantsWebApiClient tenantClient, ICheckoutSettingsWebApiClient checkoutSettingsClient, ICouponSetWebApiClient couponSetClient)
        {
            _discountWebClient = discountWebClient;
            _discountSortFormatter = discountSortFormatter;
            _ctx = ctx;
            _tenantClient = tenantClient;
            _checkoutSettingsClient = checkoutSettingsClient;
            _couponSetClient = couponSetClient;
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
                var couponSets = (await _couponSetClient.GetCouponSets(filter: string.Format("assigneddiscountid eq {0}", pagingParams.NumericId))).ReadAsSync();
                var singleModel = Mapper.Map<Discount>(singleDiscount);
                singleModel.CouponSets = Mapper.Map<List<CouponSet>>(couponSets.Items);
                return List2(singleModel);
            }


            var couponSetId = extFilter.QueryString.Get("couponsetid");
            if (!String.IsNullOrEmpty(couponSetId))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "couponsetid", value = couponSetId });
            }

            var query = extFilter.QueryString.Get("query");
            if (!String.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "all", value = query });
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
                    var model = Mapper.Map<Discount>(response);
                    if (!discount.CouponSets.IsNullOrEmpty())
                    {
                        discount.Id = model.Id;
                        var addedCouponSets = await AssignCouponSetsToDiscount(discount, new DC.CouponSetCollection {Items = new List<DC.CouponSet>()});
                        model.CouponSets = addedCouponSets;
                    }
                    responseList.Add(model);
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
                bool discountHasCoupons = !discount.CouponSets.IsNullOrEmpty();
                discount.RequiresCoupon = discountHasCoupons || !string.IsNullOrEmpty(discount.CouponCode);
                var dc = Mapper.Map<DC.Discount>(discount);
                var res = (await _discountWebClient.UpdateDiscount(dc, discount.Id)).ReadAsSync();

                var currentCouponSets = (await _couponSetClient.GetCouponSets(filter: string.Format("assigneddiscountid eq {0}", discount.Id))).ReadAsSync();
                //merge
                if (discountHasCoupons || currentCouponSets.TotalCount > 0)
                {
                    await UnassignCouponSetsFromDiscount(currentCouponSets, discount);
                    await AssignCouponSetsToDiscount(discount, currentCouponSets);
                }
                
                var savedCouponSets = (await _couponSetClient.GetCouponSets(filter: string.Format("assigneddiscountid eq {0}", discount.Id))).ReadAsSync();
                var model = Mapper.Map<Discount>(res);
                model.CouponSets = Mapper.Map<List<CouponSet>>(savedCouponSets.Items);
                retList.Add(model);
            }

            return List2(retList);
        }

        private async Task UnassignCouponSetsFromDiscount(DC.CouponSetCollection currentCouponSets, Discount discount)
        {
            var deleteList =
                currentCouponSets.Items.Where(x => !discount.CouponSets.Select(cs => cs.Id).Contains(x.Id));

            var deleteTasks =
                deleteList.Select(
                    x =>
                        _couponSetClient.UnAssignDiscount(x.CouponSetCode,
                            new DC.AssignedDiscount
                            {
                                CouponSetCode = x.CouponSetCode,
                                CouponSetId = x.Id.GetValueOrDefault(),
                                DiscountId = discount.Id.GetValueOrDefault()
                            })).ToList();

            await Task.WhenAll(deleteTasks);
            deleteTasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();
        }

        private async Task<List<CouponSet>> AssignCouponSetsToDiscount(Discount discount, DC.CouponSetCollection currentCouponSets)
        {
            var addList = discount.CouponSets.Where(x => !currentCouponSets.Items.Select(cs => cs.Id).Contains(x.Id)).ToList();

            if (!addList.Any())
                return new List<CouponSet>();
            var addTasks =
                addList.Select(
                    x => _couponSetClient.AssignDiscount(x.CouponSetCode,
                        new DC.AssignedDiscount
                        {
                            CouponSetCode = x.CouponSetCode,
                            CouponSetId = x.Id.GetValueOrDefault(),
                            DiscountId = discount.Id.GetValueOrDefault()
                        })).ToList();

            await Task.WhenAll(addTasks);
            addTasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();
            return addList;
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
            var displayNameLookup = new Dictionary<string, string>
            {
                { SiteSettings.Order.Contracts.Constants.ThirdPartyPayment.PAYPAL_EXPRESS.ToUpper(), "PayPal Express"},
                { SiteSettings.Order.Contracts.Constants.ThirdPartyPayment.VISA_CHECKOUT.ToUpper(), "Visa Checkout"}
            };

            var paymentSettings = (await _checkoutSettingsClient.GetPaymentSettings()).ReadAsSync();

            var enabledPaymentWorkflows = paymentSettings.ExternalPaymentWorkflowDefinitions
                                        .Where(x => x.IsEnabled)
                                        .Select(wf => new KeyValuePair<string, string>(wf.Name,
                                            displayNameLookup.ContainsKey(wf.Name.ToUpper())
                                                ? displayNameLookup[wf.Name.ToUpper()]
                                                : wf.Name))
                                        .ToList();

            return List2(enabledPaymentWorkflows);
        }
    }
}