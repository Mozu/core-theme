using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using DCOrder = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteSettings.Order.Contracts.Clients;
using System.Linq;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class OrderHelper
    {
        private readonly Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;

        public OrderHelper(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient)
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
        }

        public async Task<List<Order>> OrderPaymentsByCapture(List<Order> Orders)
        {

            var paymentSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();

            var paymentRankings = paymentSettings.PaymentRanking.Split(',');

            
            Orders.ForEach(order => {
                order.Payments = order.Payments.Reverse<OrderPayment>().ToList();
                order.Payments = order.Payments.OrderBy(payment => payment, new PaymentHelper.PaymentRankingComparer(paymentRankings)).ToList();
                
            });

            return Orders;
        }
    }
}