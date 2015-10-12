// -----------------------------------------------------------------------
// <copyright file="ProductImageCollection.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class ProductImageCollection :List<ProductImage > , IAlternateNamingValueContainer
    {
        public Product Product { get; set; }
        public ProductImageCollection(){}
        
        public ProductImageCollection(IEnumerable<ProductImage> collection):base( collection  )
        {
        
        }
        
        public ProductImageCollection(int capacity):base( capacity )
        {
        
        }
        [AlternateName("main")]
        [AlternateName("mainimage")]
        public ProductImage Main
        {
            get { return this.FirstOrDefault(); }
        }

        public object this[string key]
        {
            get { return this.GetAlternateNamedValue(key); }
        }
    }
}
