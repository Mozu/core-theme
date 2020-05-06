using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api;
using NSubstitute;
using Mozu.SiteBuilder.UnitTests.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCorder = Mozu.CommerceRuntime.Contracts.Orders;
using DCcommerce = Mozu.CommerceRuntime.Contracts;
using DCcustomer = Mozu.Customer.Contracts;
using DCsiteSettings = Mozu.SiteSettings.Order.Contracts.Clients;
using DCprod = Mozu.ProductRuntime.Contracts;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api
{
    [Category("Order")]
    [TestFixture]
    public class OrderHelperTest
    {
        private static List<OrderPayment> _payments = new List<OrderPayment>
            {
               new OrderPayment { PaymentType = "CreditCard", CardType = "MC" },
               new OrderPayment { PaymentType = "CreditCard", CardType = "VISA" },
               new OrderPayment { PaymentType = "CreditCard", CardType = "AMEX" },
               new OrderPayment { PaymentType = "GiftCard", CardType = "GC" },
               new OrderPayment { PaymentType = "StoreCredit", CardType ="" }
            };

        private static List<OrderPayment> _paymentDuplicates = new List<OrderPayment>
            {
               new OrderPayment { Id = "MC1", PaymentType = "CreditCard", CardType = "MC" },
               new OrderPayment { Id = "MC2", PaymentType = "CreditCard", CardType = "MC" },
               new OrderPayment { Id = "MC3", PaymentType = "CreditCard", CardType = "MC" },
               new OrderPayment { Id = "GC1", PaymentType = "GiftCard", CardType = "GC" },
               new OrderPayment { Id = "GC2", PaymentType = "GiftCard", CardType = "GC" },
               new OrderPayment { Id = "SC1", PaymentType = "StoreCredit", CardType =""},
               new OrderPayment { Id = "SC2", PaymentType = "StoreCredit", CardType =""}
            };

        [SetUp]
        public void Setup()
        {


        }

        [Test]
        public void Order_Retains_Payments()
        {
            var orderHelper = CreateOrderHelper();
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.Count(), Is.EqualTo(5));
            });
        }

        [Test]
        public void Order_Payments_Ranked_By_GC_MC_VISA()
        {
            var orderHelper = CreateOrderHelper("GC,MC,VISA");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo("GC"));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("MC"));
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo("VISA"));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("AMEX"));
            });
        }

        [Test]
        public void Order_Payments_Ranked_By_STORECREDIT_MC_VISA()
        {
            var orderHelper = CreateOrderHelper("STORECREDIT,MC,VISA");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("MC"));
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo("VISA"));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo("GC"));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("AMEX"));
            });
        }

        [Test]
        public void Order_Payments_Ranked_By_AMEX_MASTERCARD_VISA()
        {
            var orderHelper = CreateOrderHelper("AMEX, mastercard,VISA");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo("AMEX"));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("MC"));
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo("VISA"));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("GC"));
            });
        }

        [Test]
        public void Order_Payments_Ranked_By_VISA_AMERICANEXPRESS()
        {
            var orderHelper = CreateOrderHelper("VISA,AMERICANEXPRESS");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo("VISA"));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("AMEX"));               
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo("GC"));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("MC"));
            });
        }

        [Test]
        public void Order_Payments_Ranked_With_No_Ranks()
        {
            var orderHelper = CreateOrderHelper();
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).PaymentType, Is.EqualTo("StoreCredit"));
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(1).PaymentType, Is.EqualTo("GiftCard"));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("GC"));
                Assert.That(order.Payments.ElementAt(2).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo("AMEX"));
                Assert.That(order.Payments.ElementAt(3).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo("VISA"));
                Assert.That(order.Payments.ElementAt(4).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("MC"));

            });
        }

        [Test]
        public void Order_Payments_Ranked_By_GC_MC()
        {
           
            var orderHelper = CreateOrderHelper("GC,MC");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_payments));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).PaymentType, Is.EqualTo("GiftCard"));
                Assert.That(order.Payments.ElementAt(0).CardType, Is.EqualTo("GC"));
                Assert.That(order.Payments.ElementAt(1).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(1).CardType, Is.EqualTo("MC"));
                Assert.That(order.Payments.ElementAt(2).PaymentType, Is.EqualTo("StoreCredit"));
                Assert.That(order.Payments.ElementAt(2).CardType, Is.EqualTo(""));
                Assert.That(order.Payments.ElementAt(3).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(3).CardType, Is.EqualTo("AMEX"));
                Assert.That(order.Payments.ElementAt(4).PaymentType, Is.EqualTo("CreditCard"));
                Assert.That(order.Payments.ElementAt(4).CardType, Is.EqualTo("VISA"));
                
            });
        }

        [Test]
        public void Order_Duplicate_Payments_Ranked_By_GC()
        {

            var orderHelper = CreateOrderHelper("GC");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_paymentDuplicates));

            orderPaymentsByCapture.Result.ForEach(order => {
                Assert.That(order.Payments.ElementAt(0).Id, Is.EqualTo("GC2"));
                Assert.That(order.Payments.ElementAt(1).Id, Is.EqualTo("GC1"));

                Assert.That(order.Payments.ElementAt(2).Id, Is.EqualTo("SC2"));
                Assert.That(order.Payments.ElementAt(3).Id, Is.EqualTo("SC1"));

                Assert.That(order.Payments.ElementAt(4).Id, Is.EqualTo("MC3"));
                Assert.That(order.Payments.ElementAt(5).Id, Is.EqualTo("MC2"));
                Assert.That(order.Payments.ElementAt(6).Id, Is.EqualTo("MC1"));
                
                
            });
        }

        [Test]
        public void Order_Duplicate_Payments_Ranked_By_GC_MASTERCARD()
        {

            var orderHelper = CreateOrderHelper("SC,mastercard");
            var orderPaymentsByCapture = orderHelper.OrderPaymentsByCapture(createNewOrderCollection(_paymentDuplicates));

            orderPaymentsByCapture.Result.ForEach(order => {
                

                Assert.That(order.Payments.ElementAt(0).Id, Is.EqualTo("SC2"));
                Assert.That(order.Payments.ElementAt(1).Id, Is.EqualTo("SC1"));

                Assert.That(order.Payments.ElementAt(2).Id, Is.EqualTo("MC3"));
                Assert.That(order.Payments.ElementAt(3).Id, Is.EqualTo("MC2"));
                Assert.That(order.Payments.ElementAt(4).Id, Is.EqualTo("MC1"));

                Assert.That(order.Payments.ElementAt(5).Id, Is.EqualTo("GC2"));
                Assert.That(order.Payments.ElementAt(6).Id, Is.EqualTo("GC1"));


            });
        }

        private List<Order> createNewOrderCollection(List<OrderPayment> payments)
        {
            return new List<Order>
            {
                new Order
                {
                    Payments = payments

                }
            };
        }

        private OrderHelper CreateOrderHelper(string paymentRankings = "")
        {
            var checkoutSettingsWebApiClient = NSubstitute.Substitute.For<DCsiteSettings.ICheckoutSettingsWebApiClient>();
            
            var paymentSettings = new Mozu.SiteSettings.Order.Contracts.PaymentSettings()
            {
                PaymentRanking = paymentRankings
            };

            checkoutSettingsWebApiClient.GetPaymentSettings().Returns(paymentSettings.AsServiceClientResponseAsync());
            return new OrderHelper(checkoutSettingsWebApiClient);
        }      
    }
}
