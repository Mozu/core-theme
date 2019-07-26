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

        private class PaymentRankingComparer : IComparer<OrderPayment>
        {
            public string[] Rankings { get; }
            public PaymentRankingComparer(string[] rankings)
            {
                Rankings = rankings;
            }

            private bool hasCardType(string rank, string cardType)
            {
                rank = rank.ToLower().Trim();
                cardType = cardType.ToLower();

                switch (rank)
                {
                    case "mastercard":
                        rank = "mc";
                        break;
                    case "giftcard":
                        rank = "gc";
                        break;
                    case "americanexpress":
                        rank = "amex";
                        break;
                    case "american express":
                        rank = "amex";
                        break;
                    case "storecredit":
                        rank = "";
                        break;
                    case "sc":
                        rank = "";
                        break;
                    default:
                        break;
                }

                if(rank == cardType)
                {
                    return true;
                }

                return false;
            }

            public int Compare(OrderPayment x, OrderPayment y)
            {
                var xIdx = Array.FindIndex(Rankings, rank => hasCardType(rank, x.CardType));
                var yIdx = Array.FindIndex(Rankings, rank => hasCardType(rank, y.CardType));

                if(xIdx == -1){
                    xIdx = int.MaxValue;
                }
                if (yIdx == -1) {
                    yIdx = int.MaxValue;
                }

                if (xIdx == yIdx)
                {
                    return 0;
                }
                if (xIdx > yIdx)
                {
                    return 1;
                }
                else
                {
                    return -1;
                }

            }
        }


        public async Task<List<Order>> OrderPaymentsByCapture(List<Order> Orders)
        {
            var paymentSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();

            var paymentRankings = paymentSettings.PaymentRanking.Split(',');

            
            Orders.ForEach(order => {

                order.Payments = order.Payments.Reverse<OrderPayment>().ToList();
                order.Payments = order.Payments.OrderBy(payment => payment, new PaymentRankingComparer(paymentRankings)).ToList();
                
            });

            return Orders;
        }
    }
}