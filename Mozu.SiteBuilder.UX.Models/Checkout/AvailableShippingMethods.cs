using System.Collections.Generic;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    public class AvailableShippingMethods
    {
        public AvailableShippingMethods() : this(new ShippingMethodInformation[0])
        {
        }

        public AvailableShippingMethods(IEnumerable<ShippingMethodInformation> shippingMethodInformations)
        {
            Items = shippingMethodInformations.ToList();
        }

        public List<ShippingMethodInformation> Items { get; set; }

        public string Message { get; set; }
    }
}