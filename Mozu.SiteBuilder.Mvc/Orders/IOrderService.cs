using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Orders
{
    public interface IOrderService
    {
        OrderInformation GetOrder(string orderId);

        AvailableShippingMethods GetAvailableShippingMethods(OrderInformation order);

        ContactInformation GetOrderContact(Mozu.Core.ProfileToken  profileToken);

        void UpdateShippingMethod(ShippingMethodInformation shippingMethodInformation, string orderId);

        void UpdateShippingAddress(ShipmentInformation shipmentInformation, string orderId);

        void UpdatePayment(PaymentInformation paymentInformation, string orderId);

        void UpdateComment(string content, string orderId);

        void UpdateCoupon(string orderId, OrderInformation orderInformation);

        OrderInformation Submit(string orderId, OrderInformation orderInformation);

        List<KeyValuePair<string, string>> GetShippableCountries();

        void CreateAccount(SubmitInformation submitInformation, string orderId);

        //string GetMerchantId();
    }
}