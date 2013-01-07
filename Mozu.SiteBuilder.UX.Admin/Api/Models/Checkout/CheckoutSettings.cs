using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class CheckoutSettings
    {
        [DataMember(Name = "paymentSettings")]
        public PaymentSettings PaymentSettings { get; set; }

        [DataMember(Name = "customerCheckoutSettings")]
        public CustomerCheckoutSettings CustomerCheckoutSettings { get; set; }

        [DataMember(Name = "orderProcessingSettings")]
        public OrderProcessingSettings OrderProcessingSettings { get; set; }
    }
}