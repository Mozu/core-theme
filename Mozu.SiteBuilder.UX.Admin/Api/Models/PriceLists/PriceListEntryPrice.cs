using System;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntryPrice
    {
        public int Id { get; set; }

        public string PriceListCode { get; set; }

        public string ProductCode { get; set; }

        public int? MinQuantity { get; set; }

        public int? MaxQuantity { get; set; }

        /// <summary>
        /// The price.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? ListPrice { get; set; }

        public PriceListEntryCalculation ListPriceCalculation { get; set; }

        /// <summary>
        /// The list price.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? SalePrice { get; set; }

        public PriceListEntryCalculation SalePriceCalculation { get; set; }

        /// <summary>
        /// Manufacturer Suggested Retail Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "msrp")]
        public decimal? MSRP { get; set; }

        /// <summary>
        /// Minimum Advertised Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "map")]
        public decimal? MAP { get; set; }

        /// <summary>
        /// Minimum Advertised Price Start Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapStartDate")]
        public DateTime? MAPStartDate { get; set; }

        /// <summary>
        /// Minimum Advertised Price End Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapEndDate")]
        public DateTime? MAPEndDate { get; set; }

        /// <summary>
        /// Cost Currency Code
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CostCurrencyCode { get; set; }

        /// <summary>
        /// Cost
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Cost { get; set; }

    }
}