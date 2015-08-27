using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class Adjustment
    {
        public decimal? Amount { get; set; }

        public string Description { get; set; }

        public string InternalComment { get; set; }
    }
}
