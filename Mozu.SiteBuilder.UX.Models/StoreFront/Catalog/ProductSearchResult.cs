// -----------------------------------------------------------------------
// <copyright file="ProductSearchResult.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Runtime.Serialization;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class ProductSearchResult : ProductCollection
    {
        [DataMember(EmitDefaultValue = false, Name = "categoryFacet")]
        public CategoryFacet CategoryFacet { get; set; }

        public string Query { get; set; }
    }
    [DataContract ()]
    public class CategoryFacet : ModelBase
    {
        [DataMember(EmitDefaultValue = false, Name = "items")]
        public List<CategoryFacetItem> Items { get; set; }


        //[DataMember(EmitDefaultValue = false, Name = "items")]
        //public List<FacetItem> Items { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "name")]
        //public string Name { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "id")]
        //public string Id { get; set; }
    }

     [DataContract()]
    public class CategoryFacetItem : ModelBase
    {

          [DataMember(EmitDefaultValue = false)]
        public int CategoryId { get; set; }
         [DataMember(EmitDefaultValue = false, Name = "items")]
         [AlternateName("items")]
        public List<CategoryFacetItem> Children { get; set; }
         [DataMember(EmitDefaultValue = false)]
        public int Count { get; set; }



        //[DataMember(EmitDefaultValue = false, Name = "count")]
        //public int Count { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "name")]
        public string Name { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "value")]
        public string Value { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "url")]
        public string Url { get; set; }

    }
}
