using Kibo.Fulfillment.Contracts.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class FulfillmentExtensions
    {
        public static List<EntityModelOfShipment> ExtractResources(this PagedModelOfEntityModelOfShipment resources)
        {
            return resources.Embedded != null ? resources.Embedded["shipments"] : new List<EntityModelOfShipment>();
        }
    }
}
