using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class CheckoutModel : CheckoutInformation
    {
        [DataMember(Name = "shippingAddress")]
        public dynamic ShippingAddress { get; set; }

        [DataMember(Name = "shippingMethod")]
        public dynamic ShippingMethod { get; set; }

        [DataMember(Name = "paymentSection")]
        public dynamic PaymentSection { get; set; }

        public List<string> GetAllMessages()
        {
            var sectionMessages = (new[]
            {
                ShippingAddress.StepStatus.Messages,
                ShippingMethod.StepStatus.Messages,
                PaymentSection.StepStatus.Messages,
            }).Cast<List<string>>();
            return sectionMessages.SelectMany(x => x).ToList();
        }
    }
}