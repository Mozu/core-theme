using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class OrderProcessingSettings
    {
        // Valid Values: AuthorizeAndCaptureOnOrderPlacement, AuthorizeOnOrderPlacementAndCaptureOnOrderPlacement, AuthorizeAndCaptureOnOrderShipment
        [DataMember(Name = "paymentProcessingFlowType")]
        public string PaymentProcessingFlowType { get; set; }
    }
}