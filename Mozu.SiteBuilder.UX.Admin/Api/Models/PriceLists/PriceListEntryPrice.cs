using System;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntryPrice
    {
        public int MinQty { get; set; }

        #region ListPrice

        public string ListPriceMode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? ListPrice { get; set; }

        public int ListPriceCalcSrcField { get; set; }

        public decimal? ListPriceCalcMultiplier { get; set; }

        public decimal? ListPriceCalcAdder { get; set; }

        public decimal? ListPriceCalcMax { get; set; }

        public decimal? ListPriceCalcMin { get; set; }

        #endregion

        #region SalePrice

        public string SalePriceMode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? SalePrice { get; set; }

        public int SalePriceCalcSrcField { get; set; }

        public decimal? SalePriceCalcMultiplier { get; set; }

        public decimal? SalePriceCalcAdder { get; set; }

        public decimal? SalePriceCalcMax { get; set; }

        public decimal? SalePriceCalcMin { get; set; }

        #endregion
        
    }
}