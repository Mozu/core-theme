using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCr = Mozu.CommerceRuntime.Contracts.Returns;
using DCu = Mozu.Customer.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api
{

    [WebApi("app/return", SuppressDescriptorGeneration = true)]
    public partial class ReturnController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ReturnController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnWebApiClient, ICreditWebApiClient creditWebApiClient, ISettings settings)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _returnWebApiClient = returnWebApiClient;
            _creditWebApiClient = creditWebApiClient;
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
            public string paymentType { get; set; }
            public decimal  amount { get; set; }
        }
        [HttpPostRoute(UriTemplate = "paymentAction")]
        public async Task<Response<List<Return>>> CreatePaymentActionForReturn(PaymentAction action)
        {
            var dcPaymentAction = new CommerceRuntime.Contracts.Payments.PaymentAction()
                                  {
                                      ActionName = "CreditPayment",
                                      Amount = action.amount
                                  };
            if (action.paymentType == "CreditCard")
            {
                dcPaymentAction.ReferenceSourcePaymentId = action.paymentId;
            }
            else if (action.paymentType == "StoreCredit")
            {
                dcPaymentAction.NewBillingInfo = new CommerceRuntime.Contracts.Payments.BillingInfo() { PaymentType = "StoreCredit" };
            }

            var dcRma = (await _returnWebApiClient.CreatePaymentActionForReturn(action.returnId, dcPaymentAction)).ReadAsSync();

            dcRma.RefundAmount = dcRma.Payments.Sum(x => x.AmountCredited);
            dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();
            return List2(Mapper.Map<List<Return>>(new List<DCr.Return>() {dcRma}));
        }


        public class RefundPaymentsArgs
        {
            public string ReturnId { get; set; }
            public List<RefundPaymentAction> Refunds { get; set; }

            public class RefundPaymentAction {
                public string OrderPaymentId { get; set; }
                public decimal Amount { get; set; }
            }
        }

        [HttpPostRoute(UriTemplate = "refundPayments")]
        public async Task<Response<Return>> RefundPayments(RefundPaymentsArgs args)
        {
            var existingPayments = (await _returnWebApiClient.GetPayments(args.ReturnId)).ReadAsSync();

            foreach(var refund in args.Refunds) {
                if (existingPayments != null && existingPayments.Items.Any(i => i.Id == refund.OrderPaymentId)) {
                    var ep = existingPayments.Items.First(i => i.Id == refund.OrderPaymentId);

                    var dcPaymentAction = new DCp.PaymentAction {
                        ActionName = DCp.PaymentAction.PaymentActionNameConst.CREDIT_PAYMENT,
                        Amount = refund.Amount
                    };

                    (await _returnWebApiClient.PerformPaymentActionForReturn(args.ReturnId, refund.OrderPaymentId, dcPaymentAction)).ReadAsSync();
                }
                else {
                    var dcPaymentAction = new DCp.PaymentAction {
                        ActionName = DCp.PaymentAction.PaymentActionNameConst.CREDIT_PAYMENT,
                        ReferenceSourcePaymentId = refund.OrderPaymentId,
                        Amount = refund.Amount
                    };

                    (await _returnWebApiClient.CreatePaymentActionForReturn(args.ReturnId, dcPaymentAction)).ReadAsSync();
                }
            }

            var dcReturn = (await _returnWebApiClient.GetReturn(args.ReturnId)).ReadAsSync();

            return Single2(Mapper.Map<Return>(dcReturn));
        }


        public class CreateStoreCreditArgs
        {
            public string ReturnId { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPostRoute(UriTemplate = "createStoreCredit")]
        public async Task<Response<Return>> CreateStoreCredit(CreateStoreCreditArgs args) {
            var dcPaymentAction = new DCp.PaymentAction {
                ActionName = DCp.PaymentAction.PaymentActionNameConst.CREDIT_PAYMENT,
                Amount = args.Amount,
                NewBillingInfo = new DCp.BillingInfo {
                    PaymentType = DCp.PaymentTypeConst.STORE_CREDIT
                }
            };

            var dcReturn = (await _returnWebApiClient.CreatePaymentActionForReturn(args.ReturnId, dcPaymentAction)).ReadAsSync();
            return Single2(Mapper.Map<Return>(dcReturn));
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
