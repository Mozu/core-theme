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
        private readonly IApiContext _apiContext;
        private readonly ITenantsWebApiClient _tenantClient;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsClient;
        private readonly ICouponSetWebApiClient _couponSetClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public DiscountController(IDiscountWebApiClient discountWebClient,
            IDiscountSortFormatter discountSortFormatter,
            IApiContext apiContext,
            ITenantsWebApiClient tenantClient,
            ICheckoutSettingsWebApiClient checkoutSettingsClient,
            ICouponSetWebApiClient couponSetClient)
        {
            _discountWebClient = discountWebClient;
            _discountSortFormatter = discountSortFormatter;
            _apiContext = apiContext;
            _tenantClient = tenantClient;
            _checkoutSettingsClient = checkoutSettingsClient;
            _couponSetClient = couponSetClient;
        }

        /// <summary>
        /// Get a list of discounts.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Discount>>> ListDiscounts(PagingParamaters pagingParams,
            FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                return await GetSingleDiscountAsync(pagingParams);
            }

            var couponSetId = extFilter.QueryString.Get("couponsetid");
            if (!string.IsNullOrEmpty(couponSetId))
            {
                extFilter.Add(new FilterCollectionItem
                {
                    comparison = "eq",
                    field = "couponsetid",
                    value = couponSetId
                });
            }

            var query = extFilter.QueryString.Get("query");
            if (!string.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem
                {
                    comparison = "eq",
                    field = "all",
                    value = query
                });
            }

            string filter = null;
            if (extFilter.Count > 0)
            {
                var tenant = (await _tenantClient.GetTenant(_apiContext.TenantId)).ReadAsSync();
                var masterCatalog = tenant.MasterCatalogs.FirstOrDefault(mc => mc.Id == _apiContext.MasterCatalogId);
                if (masterCatalog != null)
                {
                    var defaultLocalCode = masterCatalog.DefaultLocaleCode;
                    var masterNumberFormat = CultureInfo.GetCultureInfo(defaultLocalCode).NumberFormat;
                    filter = extFilter.ToFilterString(_apiContext, masterNumberFormat, _tenantClient);
                }
            }

            var sortBy = pagingParams.ToSort(_discountSortFormatter);
            const string responseFields =
                "items(id,content(name,friendlyDescription),amountType,amount,status,currentRedemptionCount,thresholdMessage," +
                "stackingLayer,canBeStackedUpon," +
                "target(categories,products,includeAllProducts,type)," +
                "conditions(minimumOrderAmount,startDate,expirationDate,requiresCoupon,couponCode),auditInfo)";

            try
            {
                var discountList = (await _discountWebClient.GetDiscounts(pagingParams.startIndex,
                    pagingParams.pageSize, sortBy, filter, responseFields: responseFields)).ReadAsSync();

                var discounts = Mapper.Map<List<Discount>>(discountList.Items);
                return List2(discounts, discountList.TotalCount);
            }
            catch (ApiWebClientConnectionException e)
            {
                return FailureList2<Discount>(e.Message);
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
                discount.RequiresCoupon =
                    !discount.CouponSets.IsNullOrEmpty() || !string.IsNullOrEmpty(discount.CouponCode);
                var dc = Mapper.Map<DC.Discount>(discount);

                // the Mozu service does not accept a null StartDate, even though the field is nullable.
                // TODO: this may be fixed in the future on their end.
                if (dc.Conditions.StartDate == null)
                {
                    dc.Conditions.StartDate = DateTime.UtcNow;
                }

                // the Mozu service does not allow us to pick "FreeShipping" but have no shipping methods associated.
                if (dc.Target.Type == "FreeShipping" &&
                    (dc.Target.ShippingMethods == null || dc.Target.ShippingMethods.Count == 0))
                {
                    var targetedShippingMethod = new DC.TargetedShippingMethod
                    {
                        Code = "FreeShipping",
                        Name = "Free Shipping"
                    };
                    dc.Target.ShippingMethods = new List<DC.TargetedShippingMethod>(new[] {targetedShippingMethod});
                }

                try
                {
                    var response = (await _discountWebClient.CreateDiscount(dc)).ReadAsSync();
                    var model = Mapper.Map<Discount>(response);
                    model.CouponSets = await AssignCouponSetsOnCreate(model.Id, discount);
                    responseList.Add(model);
                }
                catch (ApiWebClientConnectionException e)
                {
                    return FailureList2<Discount>(e.Message);
                }
            }

            return List2(responseList);
        }

        private async Task<List<CouponSet>> AssignCouponSetsOnCreate(int? discountId, Discount discount)
        {
            if (discount.CouponSets.IsNullOrEmpty())
            {
                return new List<CouponSet>();
            }

            var addTasks = AssignCouponSetsToDiscountTasks(discountId, discount.CouponSets);
            await Task.WhenAll(addTasks);
            addTasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return discount.CouponSets;
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
                discount.RequiresCoupon =
                    !discount.CouponSets.IsNullOrEmpty() || !string.IsNullOrEmpty(discount.CouponCode);
                var dc = Mapper.Map<DC.Discount>(discount);
                var res = (await _discountWebClient.UpdateDiscount(dc, discount.Id ?? -1)).ReadAsSync();

                await MergeCouponSets(discount);
                var savedCouponSets = (await _couponSetClient.GetCouponSets(
                    filter: $"assigneddiscountid eq {discount.Id}",
                    responseGroups: "Counts")).ReadAsSync();

                var model = Mapper.Map<Discount>(res);
                model.CouponSets = Mapper.Map<List<CouponSet>>(savedCouponSets.Items);
                retList.Add(model);
            }

            return List2(retList);
        }

        private async Task MergeCouponSets(Discount discount)
        {
            var currentCouponSets =
                (await _couponSetClient.GetCouponSets(filter: $"assigneddiscountid eq {discount.Id}")).ReadAsSync();

            if (discount.CouponSets.IsNullOrEmpty() && currentCouponSets.TotalCount == 0)
            {
                return;
            }

            var tasks = new List<Task>();

            var deleteList = currentCouponSets.Items
                .Where(x => !discount.CouponSets.Select(cs => cs.Id).Contains(x.Id));

            var delTasks = UnassignCouponSetsFromDiscountTasks(discount.Id, deleteList);
            tasks.AddRange(delTasks);

            var addList = discount.CouponSets
                .Where(x => !currentCouponSets.Items.Select(cs => cs.Id).Contains(x.Id));

            var addTasks = AssignCouponSetsToDiscountTasks(discount.Id, addList);
            tasks.AddRange(addTasks);

            await Task.WhenAll(tasks);

            delTasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();
            addTasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();
        }

        private List<Task<ServiceClientResponse<StreamContent>>> UnassignCouponSetsFromDiscountTasks(int? discountId,
            IEnumerable<DC.CouponSet> deleteList)
        {
            var deleteTasks = deleteList
                .Select(x => _couponSetClient.UnAssignDiscount(x.CouponSetCode, discountId ?? -1))
                .ToList();

            return deleteTasks;
        }

        private List<Task<ServiceClientResponse<StreamContent>>> AssignCouponSetsToDiscountTasks(int? discountId,
            IEnumerable<CouponSet> addList)
        {
            return addList
                .Select(x => _couponSetClient.AssignDiscount(x.CouponSetCode, new DC.AssignedDiscount
                {
                    CouponSetCode = x.CouponSetCode,
                    CouponSetId = x.Id.GetValueOrDefault(),
                    DiscountId = discountId.GetValueOrDefault()
                }))
                .ToList();
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<Discount>> DeleteDiscount(List<Discount> discounts)
        {
            var tasks = discounts.Select(d => _discountWebClient.DeleteDiscount(d.Id ?? -1)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<Discount>(discounts.Count);
        }

        [HttpGetRoute(UriTemplate = "paymentworkflow/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetPaymentWorkflows(
            PagingParamaters pagingParams,
            FilterCollection extFilter)
        {
            var displayNameLookup = new Dictionary<string, string>
            {
                {
                    SiteSettings.Order.Contracts.Constants.ThirdPartyPayment.PAYPAL_EXPRESS.ToUpper(),
                    "PayPal Express"
                },
                {
                    SiteSettings.Order.Contracts.Constants.ThirdPartyPayment.VISA_CHECKOUT.ToUpper(),
                    "Visa Checkout"
                }
            };

            var paymentSettings = (await _checkoutSettingsClient.GetPaymentSettings()).ReadAsSync();

            var enabledPaymentWorkflows = paymentSettings
                .ExternalPaymentWorkflowDefinitions
                .Where(wf => wf.IsEnabled)
                .Select(wf => new KeyValuePair<string, string>(wf.Name,
                    displayNameLookup.ContainsKey(wf.Name.ToUpper())
                        ? displayNameLookup[wf.Name.ToUpper()]
                        : wf.Name))
                .ToList();

            return List2(enabledPaymentWorkflows);
        }

        private async Task<Response<List<Discount>>> GetSingleDiscountAsync(PagingParamaters pagingParams)
        {
            var singleDiscount = (await _discountWebClient.GetDiscount(pagingParams.NumericId ?? -1)).ReadAsSync();
            var couponSets = (await _couponSetClient.GetCouponSets(
                filter: $"assigneddiscountid eq {pagingParams.NumericId}",
                responseGroups: "Counts")).ReadAsSync();

            var singleModel = Mapper.Map<Discount>(singleDiscount);
            singleModel.CouponSets = Mapper.Map<List<CouponSet>>(couponSets.Items);

            return List2(singleModel);
        }
    }
}