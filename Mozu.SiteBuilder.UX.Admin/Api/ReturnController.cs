using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
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
using ReturnActions = Mozu.CommerceRuntime.Contracts.Returns.ReturnAction.ReturnActionNameConst;
using PaymentActions = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;
using PaymentTypes = Mozu.CommerceRuntime.Contracts.Payments.PaymentTypeConst;

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
        public async Task<Response<List<Return>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft = false)
		{
		    string originalOrderId;
		    var filter = "";

            if (extFilter.TryGetValue("originalOrderId", out originalOrderId))
		    {
		        filter = string.Format("originalorderid eq \"{0}\" and status ne \"{1}\"", originalOrderId, "null");
		    }
		    var returns = (await _returnWebApiClient.GetReturns(filter: filter)).ReadAsSync();
            return List2(Mapper.Map<List<Return>>(returns.Items));
        }

		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Return>>> Create(List<Return> returns )
		{
		    var retList = new List<Return>();
            foreach (var rma in returns)
            {
                var dcRma = Mapper.Map<DCr.Return>(rma);
                dcRma = (await _returnWebApiClient.CreateReturn(dcRma)).ReadAsSync();
                if (dcRma.AvailableActions.Contains(ReturnActions.AUTHORIZE))
                {
                    dcRma = (await _returnWebApiClient.PerformReturnActions(new DCr.ReturnAction()
                                                                                {
                                                                                    ActionName = ReturnActions.AUTHORIZE,
                                                                                    ReturnIds = new List<string> {dcRma.Id}
                                                                                })).ReadAsSync().Items.First();
                    
                    
                }
                retList.Add(Mapper.Map<Return>(dcRma));
            }

            return List2(retList);
        }


        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<Return>>> PerformReturnActions(DCr.ReturnAction action)
        {
            var dcRma = (await _returnWebApiClient.PerformReturnActions(action)).ReadAsSync().Items;

            return List2(Mapper.Map<List<Return>>(dcRma));
        }

        public class PaymentActionDTO
        {
            public string OrderId { get; set; }
            public string ReturnId { get; set; }
            public string PaymentId { get; set; }
            public string PaymentType { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpGetRoute(UriTemplate = "returnReasons")]
        public async Task<Response<List<string>>> GetReturnReasons()
        {
            var returnReasons = (await _returnWebApiClient.GetReturnReasons()).ReadAsAsync();
            return List2(Mapper.Map<List<string>>(returnReasons));
        }

        [HttpPostRoute(UriTemplate = "paymentAction")]
        public async Task<Response<List<Return>>> CreatePaymentActionForReturn(PaymentActionDTO action)
        {
            var dcPaymentAction = new DCp.PaymentAction
                                  {
                                      ActionName = PaymentActions.CREDIT_PAYMENT,
                                      Amount = action.Amount
                                  };

            switch (action.PaymentType)
            {
                case PaymentTypes.CREDIT_CARD:
                    dcPaymentAction.ReferenceSourcePaymentId = action.PaymentId;
                    break;
                case PaymentTypes.STORE_CREDIT:
                    dcPaymentAction.NewBillingInfo = new DCp.BillingInfo { PaymentType = PaymentTypes.STORE_CREDIT };
                    break;
            }

            var dcRma = (await _returnWebApiClient.CreatePaymentActionForReturn(action.ReturnId, dcPaymentAction)).ReadAsSync();

            dcRma.RefundAmount = dcRma.Payments.Sum(x => x.AmountCredited);
            dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();
            return List2(Mapper.Map<List<Return>>(new List<DCr.Return> {dcRma}));
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
                        ActionName = PaymentActions.CREDIT_PAYMENT,
                        Amount = refund.Amount
                    };

                    (await _returnWebApiClient.PerformPaymentActionForReturn(args.ReturnId, refund.OrderPaymentId, dcPaymentAction)).ReadAsSync();
                }
                else {
                    var dcPaymentAction = new DCp.PaymentAction {
                        ActionName = PaymentActions.CREDIT_PAYMENT,
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
                ActionName = PaymentActions.CREDIT_PAYMENT,
                Amount = args.Amount,
                NewBillingInfo = new DCp.BillingInfo {
                    PaymentType = PaymentTypes.STORE_CREDIT
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

        [HttpPostRoute(UriTemplate = "resendemail")]
        public async Task<Response<Return>> SendRMAEmail(DCr.ReturnAction action)
        {
            await (await _returnWebApiClient.ResendReturnEmail(action)).ReadAsAsync();

            return this.EmptySingle2<Return>();
        }
    }
}
