using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web.Mvc;

using Mozu.SiteBuilder.UX.Models.ModelMetaData;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    [DataContract]
    public class Product: Mozu.ProductRuntime.Contracts.Product
    {
        public string ProductName
        {
            get { return this.Content!= null ? this.Content.ProductName :null;}
        }
        public ProductImageCollection Images
        {
            get { return this.Content != null ? this.Content.ProductImages : new ProductImageCollection(); }
        }
       public string Url
        {
            get
            {

                var x = this.Price;
                var y = this.PriceRange;
                
                return "/product/" + this.ProductCode;

            }
        }
        [DataMember]
       public new ProductContent Content { get; set; }
        
    }



  
    public class RepeaterItem
    {
        public string Text { get; set; }
        public bool Selected { get; set; }
        public object Value { get; set; }
    }
    public class PagingModel 
    {
        int? _cP;
        public int CurrentPage
        {
            get
            {
                if (!_cP.HasValue && PageSize != 0)
                {
                    this.
                    _cP = (int)Math.Ceiling((double)StartIndex / (double)PageSize) + 1; 
                }
                return _cP.GetValueOrDefault(1);
            }
            set
            {
                _cP = value;
            }
        }
        public int CurrentItemsPerPage { get; set; }
        public string CurrentSort { get; set; }
        List<RepeaterItem> _sorts;
        List<RepeaterItem> _pageSizes;
        List<RepeaterItem> _pages;
        
        public List<RepeaterItem> Sorts
        {
            get
            {
                Init();
                return _sorts;
            }
            set
            {
                _sorts = value;
            }
        }
        public List<RepeaterItem> PageSizes
        {
            get
            {
                Init();
                return _pageSizes;
            }
            set
            {
                _pageSizes = value;
            }
        }

        public List<RepeaterItem> Pages
        {
            get
            {
                Init();
                return _pages;
            }
            set
            {
                _pages = value;
            }
        }
        public string UrlBase { get; set; }
        bool _inited = false;
        public void Init (bool force= false )
        {
            if (force || _inited)
            {
                return;
            }
            _inited = true;
                
            //CurrentPage = (int)Math.Ceiling((double)StartIndex / (double)PageSize ) + 1;

            Pages = new List<RepeaterItem>();
            for (int i = 1; i <= PageCount; i++)
            {
                Pages.Add(new RepeaterItem()
                {
                    Selected = i == CurrentPage,
                    Text = i.ToString(),
                    Value = i
                });
            }

            Sorts = new List<RepeaterItem>()
            {
                new RepeaterItem (){
                    Text="Default",
                    Value=""
                },
                new RepeaterItem (){
                    Text="Price: Low to High",
                    Value="price asc"
                },
                new RepeaterItem (){
                    Text="Price: High to Low",
                    Value="price desc"

                },
                new RepeaterItem (){
                    Text="Alphabetical: A-Z",
                    Value="productName asc"

                },
                new RepeaterItem (){
                    Text="Alphabetical: Z-A",
                    Value="productName desc"

                },
                new RepeaterItem (){
                    Text="Date Added: Most Recent First",
                    Value="createDate desc"

                },
                new RepeaterItem (){
                    Text="Date Added: Most Recent Last",
                    Value="createDate asc"

                }
            };
            this.Sorts.ForEach(x => x.Selected = (string)x.Value == this.CurrentSort);
            PageSizes = new List<RepeaterItem>()
            {
                 new RepeaterItem (){
                    Text="15 per page",
                    Value=15

                },
                new RepeaterItem (){    
                    Text="30 per page",
                    Value=30

                },
                new RepeaterItem (){
                    Text="50 per page",
                    Value=50

                },
                new RepeaterItem (){
                    Text="All",
                    Value=999

                }
            };
            this.PageSizes.ForEach(x => x.Selected = (int)x.Value == this.CurrentItemsPerPage );
        
        }
        

        public int TotalCount { get; set; }

        public int StartIndex { get; set; }

        public int PageSize { get; set; }

        public int PageCount { get; set; }
    }



    public class CategoryFacet: Mozu.ProductRuntime.Contracts.CategoryFacet
    {
        
    }
    public class ProductSearchResult : ProductCollection 
    {
        [DataMember(EmitDefaultValue = false)]
        public object Respell { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public CategoryFacet CategoryFacet { get; set; }

        public string Query { get; set; }
    }
   
    public class CategoryFacetItem:  Mozu.ProductRuntime.Contracts.CategoryFacetItem
    {

        public string Name { get; set; }

        public string Url { get; set; }
    }
    public class ProductAttribute: Mozu.ProductRuntime.Contracts.ProductAttribute
    {
        
    }
    public class ProductOption : Mozu.ProductRuntime.Contracts.ProductOption
    {
   
    }
    [DataContract]
    public class ProductContent : Mozu.ProductRuntime.Contracts.ProductContent
    {
        public ProductImageCollection Images { get; set; }
        [DataMember]
        public new ProductImageCollection ProductImages { get; set; }
    }
    public class ProductImage: Mozu.ProductRuntime.Contracts.ProductImage
    {
        public string Src
        {
            get
            {
                return ImageUrl ?? ImagePath;
            }
        }
        [IgnoreDataMember]
        public ProductImageResizer Resize
        {
            get
            {
                
                return new ProductImageResizer(this);
            }
        }

        public class ProductImageResizer
        {
            ProductImage _img;
            public ProductImageResizer(ProductImage img)
            {
              
                _img = img;
            }
            public ProductImage this[object key]
            {
                get
                {
                    var pi = (ProductImage)_img.MemberwiseClone();
                    pi.ImagePath = pi.ImagePath + "?" + key;

                    return pi;
                }
            }
        }
    }
    public class ProductImageCollection: List<ProductImage>
    {
        public ProductImage Main
        {
            get { return this.FirstOrDefault(); }
        }
    }
    [DataContract]
    public class ProductCollection : Mozu.Core.Api.Contracts.PagedCollectionBase<Product>
    {
        
        int? _cP;
        public int CurrentPage
        {
            get
            {
                if (!_cP.HasValue && PageSize != 0)
                {
                   
                    _cP = (int)Math.Ceiling((double)StartIndex / (double)PageSize) + 1; 
                }
                return _cP.GetValueOrDefault(1);
            }
            set
            {
                _cP = value;
            }
        }
        public new int PageCount
        {
            get { return (int)base.PageCount; }
            set { base.PageCount = value; }
        }
        public int CurrentItemsPerPage { get; set; }
        public string CurrentSort { get; set; }
        List<RepeaterItem> _sorts;
        List<RepeaterItem> _pageSizes;
        List<RepeaterItem> _pages;
        [DataMember ]
        public List<RepeaterItem> Sorts
        {
            get
            {
                Init();
                return _sorts;
            }
            set
            {
                _sorts = value;
            }
        }
        [DataMember]
        public List<RepeaterItem> PageSizes
        {
            get
            {
                Init();
                return _pageSizes;
            }
            set
            {
                _pageSizes = value;
            }
        }
        [DataMember]
        public List<RepeaterItem> Pages
        {
            get
            {
                Init();
                return _pages;
            }
            set
            {
                _pages = value;
            }
        }
        public string UrlBase { get; set; }
        bool _inited = false;
        public void Init (bool force= false )
        {
            if (force || _inited)
            {
                return;
            }
            _inited = true;
                
            //CurrentPage = (int)Math.Ceiling((double)StartIndex / (double)PageSize ) + 1;

            Pages = new List<RepeaterItem>();
            for (int i = 1; i <= PageCount; i++)
            {
                Pages.Add(new RepeaterItem()
                {
                    Selected = i == CurrentPage,
                    Text = i.ToString(),
                    Value = i
                });
            }

            Sorts = new List<RepeaterItem>()
            {
                new RepeaterItem (){
                    Text="Default",
                    Value=""
                },
                new RepeaterItem (){
                    Text="Price: Low to High",
                    Value="price asc"
                },
                new RepeaterItem (){
                    Text="Price: High to Low",
                    Value="price desc"

                },
                new RepeaterItem (){
                    Text="Alphabetical: A-Z",
                    Value="productName asc"

                },
                new RepeaterItem (){
                    Text="Alphabetical: Z-A",
                    Value="productName desc"

                },
                new RepeaterItem (){
                    Text="Date Added: Most Recent First",
                    Value="createDate desc"

                },
                new RepeaterItem (){
                    Text="Date Added: Most Recent Last",
                    Value="createDate asc"

                }
            };
            this.Sorts.ForEach(x => x.Selected = (string)x.Value == this.CurrentSort);
            PageSizes = new List<RepeaterItem>()
            {
                 new RepeaterItem (){
                    Text="15 per page",
                    Value=15

                },
                new RepeaterItem (){    
                    Text="30 per page",
                    Value=30

                },
                new RepeaterItem (){
                    Text="50 per page",
                    Value=50

                },
                new RepeaterItem (){
                    Text="All",
                    Value=999

                }
            };
            this.PageSizes.ForEach(x => x.Selected = (int)x.Value == this.CurrentItemsPerPage );
        
        }
        

      

     

       
        //public PagingModel Paging
        //{
        //    get;
        //    set;
        //}



    }
    public class ConfiguredProduct : Mozu.ProductRuntime.Contracts.ConfiguredProduct
    {}
    public class CategoryContent: Mozu.ProductRuntime.Contracts.CategoryContent
    {
        
    }
    [DataContract]
    public class Category:  Mozu.ProductRuntime.Contracts.Category
    {
        public int? Index
        {
            get { return this.Sequence; }
            set { this.Sequence = value; }
        }
        public int? Id
        {
            get { return this.CategoryId; }
        }
        public string Name
        {
            get { return this.Content == null ? null : this.Content.Name; }
        }
        public int? ParentCategoryId
        {
            get
            {
                return this.ParentCategory != null ? (int?)this.ParentCategory.CategoryId : (int?)null;
            }
        }

        [IgnoreDataMember()]
        public new Category ParentCategory { get; set; }
    }
    public class ProductPrice2 : Mozu.ProductRuntime.Contracts.ProductPrice
    {
        //public bool HasRange
        //{
        //    get
        //    {
        //        return this.LowerBoundPrice.GetValueOrDefault(-1) > 0 || this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.UpperBoundPrice.GetValueOrDefault(-1) > 0;
        //    }
        //}
        //[DataMember(EmitDefaultValue = false, Name = "hasSalePrice")]
        //public bool HasSalePrice
        //{
        //    get
        //    {
        //        return this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.SalePrice.GetValueOrDefault(-1) > 0;
        //    }
        //}

        //[DataMember(EmitDefaultValue = false, Name = "hasDiscount")]
        //public bool HasDiscount
        //{
        //    get
        //    {
        //        return this.DiscountId.GetValueOrDefault(-1) > 0;
        //    }
        //}


        //[DataMember(EmitDefaultValue = false, Name = "offerPrice")]
        //public decimal? OfferPrice
        //{
        //    get
        //    {
        //        if (this.HasRange)
        //        {
        //            if (this.HasSalePrice)
        //            {
        //                return this.LowerBoundSalePrice;
        //            }
        //            else
        //            {
        //                return this.LowerBoundPrice;
        //            }
        //        }
        //        else
        //        {
        //            if (this.HasSalePrice)
        //            {
        //                return this.SalePrice;
        //            }
        //            else
        //            {
        //                return this.Price;
        //            }
        //        }
        //    }
        //}
    }

    [DataContract()]
    public class ProductPrice : Mozu.ProductRuntime.Contracts.ProductPrice
    {
        //[DataMember(EmitDefaultValue = false, Name = "price")]
        //public decimal? Price { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "salePrice")]
        //public decimal? SalePrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountId")]
        public int? DiscountId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountName")]
        public string DiscountName { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountEndDate")]
        public DateTime? DiscountEndDate { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "lowerBoundPrice")]
        public decimal? LowerBoundPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "lowerBoundSalePrice")]
        public decimal? LowerBoundSalePrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "upperBoundPrice")]
        public decimal? UpperBoundPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "hasRange")]
        public bool HasRange
        {
            get
            {
                return this.LowerBoundPrice.GetValueOrDefault(-1) > 0 || this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.UpperBoundPrice.GetValueOrDefault(-1) > 0;
            }
        }
        [DataMember(EmitDefaultValue = false, Name = "hasSalePrice")]
        public bool HasSalePrice
        {
            get
            {
                return this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.SalePrice.GetValueOrDefault(-1) > 0;
            }
        }

        [DataMember(EmitDefaultValue = false, Name = "hasDiscount")]
        public bool HasDiscount
        {
            get
            {
                return this.DiscountId.GetValueOrDefault(-1) > 0;
            }
        }


        [DataMember(EmitDefaultValue = false, Name = "offerPrice")]
        public decimal? OfferPrice
        {
            get
            {
                if (this.HasRange)
                {
                    if (this.HasSalePrice)
                    {
                        return this.LowerBoundSalePrice;
                    }
                    else
                    {
                        return this.LowerBoundPrice;
                    }
                }
                else
                {
                    if (this.HasSalePrice)
                    {
                        return this.SalePrice;
                    }
                    else
                    {
                        return this.Price;
                    }
                }
            }
        }
    }

    //public class Product2 : ModelBase, IModelMetadataParentContainer
    //{
    //    [AlternateName("detailsUrl")]
    //    public string Url
    //    {
    //        get
    //        {
    //            return "/product/" + this.ProductCode;

    //        }
    //    }

    //    [AlternateName("code")]
    //    [AdditionalMetadata("fieldName", "productCode")]
    //    [AdditionalMetadata("showLabel", false)]
    //    public string ProductCode { get; set; }

    //    public string BaseProductCode { get; set; }

    //    [AlternateName("name")]
    //    [AdditionalMetadata("fieldName", "productName")]
    //    [AdditionalMetadata("showLabel", true)]
    //    [AdditionalMetadata("fieldLabel", "Product Name Edit")]
    //    [AdditionalMetadata("fieldType", "text")]
    //    public string ProductName { get; set; }

    //    [AlternateName("fullDescription")]
    //    [AdditionalMetadata("fieldName", "productFullDescription")]
    //    [AdditionalMetadata("showLabel", false)]
    //    [AdditionalMetadata("fieldType", "html")]
    //    public string ProductFullDescription { get; set; }

        
        
    //    [AdditionalMetadata("fieldName", "productShortDescription")]
    //    [AdditionalMetadata("showLabel", false)]
    //    [AdditionalMetadata("fieldType", "html")]
    //    public string ProductShortDescription { get; set; }

    //    public string MetaTagTitle { get; set; }
    //    public string MetaTagDescription { get; set; }
    //    public string MetaTagKeywords { get; set; }

    //    [AdditionalMetadata("fieldName", "seoFriendlyUrl")]
    //    public string SEOFriendlyUrl { get; set; }

    //    [AlternateName("images")]
    //    [AdditionalMetadata("fieldType", "productImage")]
    //    [AdditionalMetadata("fieldName", "productImages")]
    //    public ProductImageCollection ProductImages { get; set; }
    //    [AlternateName("isPurchasable")]
    //    public bool IsPurchasable { get; set; }
    //    public string PurchasableMessage { get; set; }
    //    public bool? IsActive { get; set; }


    //    public ProductPrice Price { get; set; }

    //    public string ProductType { get; set; }
    //    public bool IsTaxable { get; set; }
    //    public int? AttributeSetId { get; set; }
    //    public bool IsRecurring { get; set; }
    //    public bool ManageStock { get; set; }
    //    public bool IsBackOrderAllowed { get; set; } 
    //    public int? StockOnHand { get; set; }
    //    public bool IsHiddenWhenOutOfStock { get; set; }
    //    public DateTime CreateDate { get; set; }
    //    public long? UPC { get; set; }
    //    public List<Category> Categories { get; set; }
    //    public bool FreeShipping { get; set; }
    //    public UnitOfMeasure PackageHeight { get; set; }
    //    public UnitOfMeasure PackageWidth { get; set; }
    //    public UnitOfMeasure PackageLength { get; set; }
    //    public UnitOfMeasure PackageWeight { get; set; }
    //    public List<ProductAttribute> Attributes { get; set; }
    //    public List<ProductOption> Options { get; set; }
       
    //    private Dictionary<string, ModelMetadata> _metaDataDictionary;

    //    public ModelMetadata GetModelMetadata(string propertyName)
    //    {
    //        if (_metaDataDictionary == null)
    //        {
    //            _metaDataDictionary = new Dictionary<string, ModelMetadata>();
    //        }

    //        ModelMetadata metaData;

    //        if (_metaDataDictionary.TryGetValue(propertyName, out metaData))
    //        {
    //            return metaData;
    //        }

    //        var prop = this.GetAlternateNamedProperty(propertyName);
    //        if (prop == null)
    //        {
    //            _metaDataDictionary[propertyName] = null;
    //            return null;
    //        }

    //        metaData = ModelMetadataProviders.Current.GetMetadataForProperty(() => prop.GetValue(this, null), this.GetType(), prop.Name );

    //        if ( !metaData.AdditionalValues.ContainsKey ("fieldType") )
    //        {
    //            metaData.AdditionalValues["fieldType"] = "text";
    //        }
    //        if (!metaData.AdditionalValues.ContainsKey("fieldName"))
    //        {
    //            //todo: turn off editing.
    //        }

    //        //mmd.AdditionalValues["productId"] = this.ProductId;
    //        metaData.AdditionalValues["productCode"] = this.ProductCode;
    //        metaData.AdditionalValues["entityType"] = "product";

    //        _metaDataDictionary[propertyName] = metaData;
    //        return metaData;
    //    }


       
    //}
}
