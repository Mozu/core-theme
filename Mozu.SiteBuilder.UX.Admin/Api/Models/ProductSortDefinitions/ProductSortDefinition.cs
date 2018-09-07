using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions
{
    public class ProductSortDefinition
    {
        public int? Id { get; set; }

        public string Name { get; set; }

        public int? CategoryId { get; set; }

        public SortingCollection SortExpressions { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public List<ProductSortPosition> Products { get; set; }
    }

}