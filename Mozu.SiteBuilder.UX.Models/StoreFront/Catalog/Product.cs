using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;




namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    [DataContract]
    public class Product : Mozu.ProductRuntime.Contracts.Product
    {
        public string ProductName
        {
            get { return this.Content != null ? this.Content.ProductName : null; }
        }

        public ProductImageCollection Images
        {
            get { return this.Content != null ? this.Content.ProductImages : new ProductImageCollection(); }
        }

        [DataMember]
        public ProductImage MainImage
        {
            get { return this.Images.FirstOrDefault(); }
        }

        public string Url
        {
            get { return "/product/" + this.ProductCode; }
        }

        [DataMember]
        public new ProductContent Content { get; set; }


        [DataMember(EmitDefaultValue = false, IsRequired = false)]
        public new List<Category> Categories { get; set; }


        [DataMember(EmitDefaultValue = false)]
        public new ProductPrice Price { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public new ProductPriceRange PriceRange { get; set; }



    }
    //public class ProductPrice: Mozu.ProductRuntime.Contracts.ProductPrice
    //{
        
    //}
   



    public class RepeaterItem
    {
        public string Text { get; set; }
        public bool Selected { get; set; }
        public object Value { get; set; }
    }

    public class PagingModel
    {
        private int? _cP;

        public int CurrentPage
        {
            get
            {
                if (!_cP.HasValue && PageSize != 0)
                {
                    this.
                        _cP = (int) Math.Ceiling((double) StartIndex/(double) PageSize) + 1;
                }
                return _cP.GetValueOrDefault(1);
            }
            set { _cP = value; }
        }

        public int CurrentItemsPerPage { get; set; }
        public string CurrentSort { get; set; }
        private List<RepeaterItem> _sorts;
        private List<RepeaterItem> _pageSizes;
        private List<RepeaterItem> _pages;

        public List<RepeaterItem> Sorts
        {
            get
            {
                Init();
                return _sorts;
            }
            set { _sorts = value; }
        }

        public List<RepeaterItem> PageSizes
        {
            get
            {
                Init();
                return _pageSizes;
            }
            set { _pageSizes = value; }
        }

        public List<RepeaterItem> Pages
        {
            get
            {
                Init();
                return _pages;
            }
            set { _pages = value; }
        }

        public string UrlBase { get; set; }
        private bool _inited = false;

        public void Init(bool force = false)
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
                            new RepeaterItem()
                                {
                                    Text = "Default",
                                    Value = ""
                                },
                            new RepeaterItem()
                                {
                                    Text = "Price: Low to High",
                                    Value = "price asc"
                                },
                            new RepeaterItem()
                                {
                                    Text = "Price: High to Low",
                                    Value = "price desc"

                                },
                            new RepeaterItem()
                                {
                                    Text = "Alphabetical: A-Z",
                                    Value = "productName asc"

                                },
                            new RepeaterItem()
                                {
                                    Text = "Alphabetical: Z-A",
                                    Value = "productName desc"

                                },
                            new RepeaterItem()
                                {
                                    Text = "Date Added: Most Recent First",
                                    Value = "createDate desc"

                                },
                            new RepeaterItem()
                                {
                                    Text = "Date Added: Most Recent Last",
                                    Value = "createDate asc"

                                }
                        };
            this.Sorts.ForEach(x => x.Selected = (string) x.Value == this.CurrentSort);
            PageSizes = new List<RepeaterItem>()
                            {
                                new RepeaterItem()
                                    {
                                        Text = "15 per page",
                                        Value = 15

                                    },
                                new RepeaterItem()
                                    {
                                        Text = "30 per page",
                                        Value = 30

                                    },
                                new RepeaterItem()
                                    {
                                        Text = "50 per page",
                                        Value = 50

                                    },
                                new RepeaterItem()
                                    {
                                        Text = "All",
                                        Value = 999

                                    }
                            };
            this.PageSizes.ForEach(x => x.Selected = (int) x.Value == this.CurrentItemsPerPage);

        }


        public int TotalCount { get; set; }

        public int StartIndex { get; set; }

        public int PageSize { get; set; }

        public int PageCount { get; set; }
    }

  

//public class CategoryFacet: Mozu.ProductRuntime.Contracts.CategoryFacet
    //{
        
    //}
    public class ProductSearchResult : ProductCollection 
    {
        [DataMember(EmitDefaultValue = false)]
        public object Respell { get; set; }

       
     
        //[DataMember(EmitDefaultValue = false)]
        //public CategoryFacet CategoryFacet { get; set; }

        public string Query { get; set; }

         [DataMember(EmitDefaultValue = false)]
        public virtual List<Mozu.ProductRuntime.Contracts.Facet> Facets { get; set; }
    }
   
    //public class CategoryFacetItem:  Mozu.ProductRuntime.Contracts.CategoryFacetItem
    //{

    //    public string Name { get; set; }

    //    public string Url { get; set; }
    //}
    //public class ProductAttribute: Mozu.ProductRuntime.Contracts.a.ProductAttribute
    //{
        
    //}
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
    public class Category : Mozu.ProductRuntime.Contracts.Category
    {

        public bool? ReadOnly;
        private List<Category> _children;

        [DataMember(EmitDefaultValue = false, Order = 4)]
        public new List<Category> ChildrenCategories
        {
            get { return _children; }
            set
            {
                if (ReadOnly.GetValueOrDefault(false))
                {
                    throw new NotImplementedException();
                }
                _children = value;
            }
        }

        [IgnoreDataMember()]
        public int? Index
        {
            get { return this.Sequence; }
            set {  }
        }
        [IgnoreDataMember()]
        public int? Id
        {
            get { return this.CategoryId; }
        }
        [IgnoreDataMember()]
        public string Name
        {
            get { return this.Content == null ? null : this.Content.Name; }
        }
        [DataMember(EmitDefaultValue = false, Order = 5)]
        public int? ParentCategoryId
        {
            get
            {
                return this.ParentCategory != null ? (int?)this.ParentCategory.CategoryId : (int?)null;
            }
        }

        [IgnoreDataMember()]
        public new  Category ParentCategory { get; set; }
    }
  

    public class ProductPriceRange : Mozu.ProductRuntime.Contracts.ProductPriceRange
    {
      

        [DataMember]
        public virtual new ProductPrice Lower { get; set; }

        [DataMember]
        public virtual new ProductPrice Upper { get; set; }
    }


    [DataContract()]
    public class ProductPrice : Mozu.ProductRuntime.Contracts.ProductPrice
    {
        public bool OnSale
        {
            get { return this.SalePrice.HasValue && this.Price.HasValue && this.SalePrice.Value != this.Price.Value; }
        }
    }
}
