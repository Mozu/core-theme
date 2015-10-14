using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Search
{
    public class SearchTuningRule
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string[] Keywords { get; set; }

        public List<KeyValuePair<string, string>> Filters { get; set; }

        public bool IsActive { get; set; }

        public bool IsDefault { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        //public List<string> BoostedProductCodes { get; set; }

        //public List<string> BlockedProductCodes { get; set; }

        public List<SimpleSearchProduct> BoostedProducts { get; set; }

        public List<SimpleSearchProduct> BlockedProducts { get; set; }

        //public List<SearchTuningRuleExpression> BoostExpressions { get; set; }

        //public List<SearchTuningRuleFunction> BoostFunctions { get; set; }

        public string LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

    }
}