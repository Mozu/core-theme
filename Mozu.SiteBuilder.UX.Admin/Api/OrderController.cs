using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/order", SuppressDescriptorGeneration = true)]
    public partial class OrderController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;

        /*
         * All order item operations have an updateMode attribute.
         * Valid options are: ApplyToOriginal, ApplyToDraft, and ApplyAndCommit
         */
        private const string APPLY_TO_ORIGINAL = "ApplyToOriginal";
        private const string APPLY_TO_DRAFT = "ApplyToDraft";
        private const string APPLY_AND_COMMIT = "ApplyAndCommit";

        /// <summary>
        /// Public constructor.
        /// </summary>
        public OrderController(IOrderWebApiClient orderWebApiClient, ISettings settings)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
        {
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            DCo.OrderCollection dcOrders = null;
            
            // get single order
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                dcOrders = new DCo.OrderCollection() { Items = new List<DCo.Order>() };
                var order = (await _orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();
                if (order != null)
                {
                    dcOrders.Items.Add(order);
                }
            }
            // get list of orders
            else
            {
                var filter = extFilter.ToFilterString();
                try
                {
                    dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), filter)).ReadAsSync();
                }
                catch (Exception ex)
                {
                    dcOrders = new DCo.OrderCollection { Items = new List<DCo.Order>() };
                }
            }

            var orders = dcOrders != null ? Mapper.Map<List<Order>>(dcOrders.Items) : new List<Order>();

            return List2(orders,(int) dcOrders.TotalCount );
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<Order>> CreateOrder()
        {
            var emptyOrder = new DCo.Order();
            
            var order = (await _orderWebApiClient.CreateOrder(emptyOrder)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class OrderIdArgs
        {
            public string OrderId { get; set; }
        }

		[HttpPostRoute(UriTemplate = "cancel")]
        public async Task<Response<Order>> CancelOrder(OrderIdArgs args)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "CancelOrder" })).ReadAsSync();

            return Single2( dc.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "commitdraft")]
        public async Task<Response<Order>> CommitDraft(OrderIdArgs args)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, true)).ReadAsSync();
            dcOrder = (await _orderWebApiClient.UpdateOrder(args.OrderId, dcOrder, APPLY_AND_COMMIT)).ReadAsSync();

            return Single2( dcOrder.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "deletedraft")]
        public async Task<Response<Order>> DeleteDraft(OrderIdArgs args)
        {
            await _orderWebApiClient.DeleteOrderDraft(args.OrderId);

            return SuccessWithTotal2<Order>(1);
        }

        public class UpdateAdjustmentArgs
        {
            public string OrderId { get; set; }
            public Adjustment OrderAdjustment { get; set; }
            public Adjustment ShippingAdjustment { get; set; }
        }
        [HttpPostRoute(UriTemplate = "adjustment")]
        public async Task<Response<Order>> AddOrUpdateAdjustment(UpdateAdjustmentArgs args)
        {   
            DCo.Order dcOrder = null;
 
            if (args.OrderAdjustment != null && args.OrderAdjustment.Amount.HasValue)
            {
                if (args.OrderAdjustment.Amount == 0)
                    dcOrder = (await _orderWebApiClient.RemoveAdjustment( args.OrderId, APPLY_TO_DRAFT )).ReadAsSync();
                else
                    dcOrder = (await _orderWebApiClient.ApplyAdjustment( args.OrderId, args.OrderAdjustment.Map<Mozu.CommerceRuntime.Contracts.Commerce.Adjustment>(), APPLY_TO_DRAFT )).ReadAsSync();
            }
            if (args.ShippingAdjustment != null && args.ShippingAdjustment.Amount.HasValue)
            {
                if (args.ShippingAdjustment.Amount == 0)
                    dcOrder = (await _orderWebApiClient.RemoveShippingAdjustment( args.OrderId, APPLY_TO_DRAFT )).ReadAsSync();
                else
                    dcOrder = (await _orderWebApiClient.ApplyShippingAdjustment(args.OrderId, args.ShippingAdjustment.Map<Mozu.CommerceRuntime.Contracts.Commerce.Adjustment>(), APPLY_TO_DRAFT)).ReadAsSync();
            }

            if (dcOrder != null)
                return Single2( dcOrder.Map<Order>() );
            else
                return Message3<Order>(false, "You must provide an order adjustment or a shipping adjustment.");
        }

        public class AddCouponArgs
        {
            public string OrderId { get; set; }
            public List<string> Coupons { get; set; }
        }
        [HttpPostRoute(UriTemplate = "addcoupon")]
        public async Task<Response<Order>> AddCoupon(AddCouponArgs args)
        {
            DCo.Order dcOrder = null;
            foreach (string couponCode in args.Coupons)
            {
                dcOrder = (await _orderWebApiClient.ApplyCoupon(args.OrderId, couponCode)).ReadAsSync();
            }

            if (dcOrder != null)
                return Single2( dcOrder.Map<Order>() );
            else
                return Message3<Order>(false, "No coupons were applied.");
        }
    }
}
