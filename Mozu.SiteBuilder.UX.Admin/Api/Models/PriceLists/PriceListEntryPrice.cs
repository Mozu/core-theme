using System;
using System.Runtime.Serialization;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntryPrice
    {
        [DataMember(EmitDefaultValue = false)]
        public int MinQty { get; set; }

        #region List Price

        [DataMember(EmitDefaultValue = false)]
        public string ListPriceMode { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public Decimal? ListPrice { get; set; }

        //calc fields

        //[DataMember(EmitDefaultValue = false)]
        //public string ListPriceCalcSrcField { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? ListPriceCalcMultiplier { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? ListPriceCalcAdder { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? ListPriceCalcMin { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? ListPriceCalcMax { get; set; }

        #endregion

        #region Sale Price

        [DataMember(EmitDefaultValue = false)]
        public string SalePriceMode { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public Decimal? SalePrice { get; set; }

        //calc fields delayed

        //[DataMember(EmitDefaultValue = false)]
        //public string SalePriceCalcField { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? SalePriceCalcMultiplier { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? SalePriceCalcAdder { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? SalePriceCalcMin { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public Decimal? SalePriceCalcMax { get; set; }

        #endregion

    }
}