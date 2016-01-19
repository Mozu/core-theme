using System.Collections.Generic;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceList
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public List<int> CustomerSegments { get; set; }

        public int Ranking { get; set; }

        public int SearchIndexSequence { get; set; }

        public AuditInfo AuditInfo { get; set; }

         
    }
}