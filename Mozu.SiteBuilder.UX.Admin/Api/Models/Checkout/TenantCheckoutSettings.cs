using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    public class TenantCheckoutSettings
    {
        public List<Gateway> Gateways { get; set; }
    }
}