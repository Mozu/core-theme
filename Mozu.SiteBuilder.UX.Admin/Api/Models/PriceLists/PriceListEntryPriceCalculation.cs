using System;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntryCalculation
    {
        public int Id { get; set; }
        //or type, since only sale or list price

        public int PriceListEntryPriceId { get; set; }

        public int SourceField { get; set; }

        public decimal? Multiplier { get; set; }

        public decimal? Adder { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }
        
    }
}