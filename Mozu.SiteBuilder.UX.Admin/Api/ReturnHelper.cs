using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using DCOrder = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using Mozu.SiteSettings.Order.Contracts.Clients;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class ReturnHelper
    {
        private readonly Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;

        public ReturnHelper(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient)
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
        }

        public async Task<List<Return>> OrderPaymentsByCapture(List<Return> Returns)
        {

            var paymentSettings = (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetPaymentSettings()).ReadAsSync();

            if(paymentSettings != null)
            {
                if (!String.IsNullOrEmpty(paymentSettings.PaymentRanking))
                {
                    var paymentRankings = paymentSettings.PaymentRanking.Split(',');

                    Returns.ForEach(rma => {
                        rma.Payments = rma.Payments.OrderBy(payment => payment, new PaymentHelper.PaymentRankingComparer(paymentRankings)).ToList();
                        rma.Payments = rma.Payments.Reverse<OrderPayment>().ToList();
                    });
                }
               
            }
           

            return Returns;
        }
    }
}