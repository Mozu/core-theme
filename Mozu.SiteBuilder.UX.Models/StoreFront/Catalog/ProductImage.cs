using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using System.Linq;
namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    public class ProductImage : ModelBase, IModelMetadataAncestorDependantItem
    {
        public ProductImageCollection Collection  { get; set; }
        public string ImageLabel { get; set; }
        public string AltText { get; set; }
        public string ImageUrl { get; set; }
        
        public string ImagePath { get; set; }
        public string VideoUrl { get; set; }
        public int? Sequence { get; set; }
        public ProductImageResizer Resize
        {
            get
            {
                return new ProductImageResizer(this);
            }
        }
        public string Src
        {
            get
            {
                return  ImageUrl ?? ImagePath;
            }
        }
        public class ProductImageResizer
        {
            ProductImage _img;
            public ProductImageResizer(ProductImage img)
            {
                _img = img;
            }
            public ProductImage this[object  key]
            {
                get
                {
                    var pi = (ProductImage) _img.MemberwiseClone();
                    pi.ImagePath = pi.ImagePath + "?" + key;
                   
                    return pi;
                }
            }
        }







        public System.Web.Mvc.ModelMetadata GetModelMetadata(System.Collections.Generic.IList<object> ancestors)
        {
            var prod = this.Collection.Product;
         //   var prod = ancestors.OfType<Product>().First();
            var mmd = prod.GetModelMetadata("ProductImages");
            int idx = prod.ProductImages.IndexOf(this);
            mmd.AdditionalValues["fieldName"] = mmd.AdditionalValues["fieldName"] + "." + idx;
            return mmd;
        }
    }
    
}