using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCr = Mozu.CommerceRuntime.Contracts.Returns;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    [WebApi("app/return", SuppressDescriptorGeneration = true)]
    public partial class ReturnController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ReturnController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnWebApiClient, ISettings settings)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _returnWebApiClient = returnWebApiClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Return>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
		{
		    string originalOrderId;
            if (extFilter.TryGetValue("originalOrderId", out originalOrderId))
            {
                try
                {
                    var returns = (await _returnWebApiClient.GetReturns(filter: string.Format("OriginalOrderId eq \"{0}\"", originalOrderId))).ReadAsSync();
                    return List2(Mapper.Map<List<Return>>(returns.Items));
                }
                catch
                {
                    //todo: waiting on chet to fix this.
                }
                var returns3 = (await _returnWebApiClient.GetReturns(startIndex: 0, pageSize: 1000)).ReadAsSync();

                return List2(Mapper.Map<List<Return>>(returns3.Items.Where(x => x.OriginalOrderId == originalOrderId).ToList() ));
            }
            


            throw new NotImplementedException();
            //
            //if (originalOrderId != null)
            //{
                
            //}
            //_returnWebApiClient.GetReturns()
            //int? startIndex = pagingParams.startIndex;
            //int? pageSize = pagingParams.pageSize ?? 20;
            //string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            //DCo.OrderCollection dcOrders = null;
            
            //// get single order
            //if (!string.IsNullOrEmpty(pagingParams.id))
            //{
            //    dcOrders = new DCo.OrderCollection() { Items = new List<DCo.Order>() };
            //    var order = (await _orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();
            //    if (order != null)
            //    {
            //        dcOrders.Items.Add(order);
            //    }
            //}
            //// get list of orders
            //else
            //{
            //    var filter = extFilter.ToFilterString();
            //    try
            //    {
            //        dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), filter)).ReadAsSync();
            //    }
            //    catch (Exception)
            //    {
            //        dcOrders = new DCo.OrderCollection { Items = new List<DCo.Order>() };
            //    }
            //}

            //var orders = dcOrders != null ? Mapper.Map<List<Order>>(dcOrders.Items) : new List<Order>();

            //return List2(orders,(int) dcOrders.TotalCount );
        }

		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Return>>> Create(List<Return > returns )
		{
		    var retList = new List<Return>();
            foreach (var rma in returns)
            {
                var dcRma = Mapper.Map<DCr.Return>(rma);
                dcRma = (await _returnWebApiClient.CreateReturn(dcRma)).ReadAsSync();
                if (dcRma.AvailableActions.Contains("Authorize"))
                {
                    dcRma = (await _returnWebApiClient.PerformReturnActions(new DCr.ReturnAction()
                                                                                {
                                                                                    ActionName = "Authorize",
                                                                                    ReturnIds = new List<string> {dcRma.Id}
                                                                                })).ReadAsSync().Items.First();
                    
                    
                }
                retList.Add(Mapper.Map<Return>(dcRma));
            }

            return List2(retList);
        }

       

        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<Return>>> PerformReturnActions(ReturnAction action)
        {
            var dcRetAction = Mapper.Map<DCr.ReturnAction>(action);
            var dcRma = (await _returnWebApiClient.PerformReturnActions(dcRetAction)).ReadAsSync().Items;

            
            return List2(Mapper.Map<List<Return>>(dcRma));
        }
        public class PaymentAction
        {
            public string orderId { get; set; }
            public string returnId { get; set; }
            public string paymentId { get; set; }
            public decimal  amount { get; set; }
        }
        [HttpPostRoute(UriTemplate = "paymentAction")]
        public async Task<Response<List<Return>>> CreatePaymentActionForReturn(PaymentAction action)
        {
            var dcPaymentAction = new CommerceRuntime.Contracts.Payments.PaymentAction()
                                  {
                                      ActionName = "CreditPayment",
                                      ReferenceSourcePaymentId = action.paymentId,
                                      Amount = action.amount

                                  };
            var dcRma = (await _returnWebApiClient.CreatePaymentActionForReturn(action.returnId, dcPaymentAction)).ReadAsSync();


            dcRma.RefundAmount = dcRma.Payments.Sum(x => x.AmountCredited);
            dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();
            return List2(Mapper.Map<List<Return>>(new List<DCr.Return>() {dcRma}));
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<Return>>> Edit(List<Return> returns)
        {
            var retList = new List<Return>();
            foreach (var rma in returns)
            {
                var dcRma = Mapper.Map<DCr.Return>(rma);
                dcRma = (await _returnWebApiClient.UpdateReturn( dcRma.Id ,dcRma)).ReadAsSync();
                
                retList.Add(Mapper.Map<Return>(dcRma));
            }

            return List2(retList);
        }
    }
}
