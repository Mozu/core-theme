
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Threading.Tasks;
using Mozu.Core.Exceptions;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    [DataContract]
  //  [System.Text.Json.Serialization.JsonConverter(typeof(ProductConverter))]
    public class Product : Mozu.ProductRuntime.Contracts.Product
    {
        [System.Text.Json.Serialization.JsonIgnore]
        public string ProductName
        {
            get { return this.Content != null ? this.Content.ProductName : null; }
        }
        [System.Text.Json.Serialization.JsonIgnore]
        public ProductImageCollection Images
        {
            get { return this.Content != null ? this.Content.ProductImages : new ProductImageCollection(); }
        }

        [DataMember]
        public ProductImage MainImage
        {
            get { return this.Images.FirstOrDefault(); }
        }

        private string _url;
        [DataMember]
        public string Url
        {
            get
            {
                if (_url == null)
                {
                    _url = (this.Content != null && !string.IsNullOrEmpty(this.Content.SEOFriendlyUrl)) ? "/" + this.Content.SEOFriendlyUrl + "/p/" + this.ProductCode : "/p/" + this.ProductCode;
                }

                return _url;
            }
        }
        [DataMember]
        public bool HasPriceRange
        {
            get
            {
                return PriceRange != null;
            }
        }

        [DataMember]
        public bool HasSubscriptionPriceRange
        {
            get
            {
                return SubscriptionPriceRange != null;
            }
        }

        [DataMember]
        public new ProductContent Content { get; set; }


        [DataMember(EmitDefaultValue = false, IsRequired = false)]
        public new List<Category> Categories { get; set; }


        [DataMember(EmitDefaultValue = false)]
        public new ProductPrice Price { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public new ProductPriceRange PriceRange { get; set; }


        [DataMember(EmitDefaultValue = false)]
        public new List<ProductVolumePrice> VolumePriceBands { get; set; }


        [DataMember(EmitDefaultValue = false)]
        public bool SupportsInStorePickup
        {
            get
            {
                return FulfillmentTypesSupported != null && FulfillmentTypesSupported.Any(x => x == FulfillmentTypeConst.InStorePickUp);
            }
        }

        [DataMember(EmitDefaultValue = false)]
        public ProductPrice SubscriptionPrice { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public ProductPriceRange SubscriptionPriceRange { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string SubscriptionMode { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public List<ProductVolumePrice> SubscriptionVolumePriceBands { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public ProductPriceRange SubscriptionVolumePriceRange { get; set; }        
    }

    /*
        public class ProductConverter : System.Text.Json.Serialization.JsonConverter<Product>
        {
            public override Product Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                throw new NotImplementedException();
            }

            public override void Write(Utf8JsonWriter writer, Product value, JsonSerializerOptions options)
            {
                writer.WriteStartObject();

                writer.WriteString("Date", wf.Date);
                writer.WriteNumber("TemperatureCelsius", wf.TemperatureCelsius);
                if (!string.IsNullOrWhiteSpace(wf.Summary) && wf.Summary != "N/A")
                {
                    writer.WriteString("Summary", wf.Summary);
                }

                writer.WriteEndObject();
            }
        }*/
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

        public void Init(bool force = false, IProductListingState state = null)
        {
            if (force || _inited)
            {
                return;
            }
            _inited = true;
            if (state != null)
            {
                CurrentSort = state.SortBy;
                StartIndex = state.StartIndex.GetValueOrDefault(StartIndex);
                PageSize = state.PageSize.GetValueOrDefault(PageSize);
                if (PageSize > 0)
                {
                    CurrentPage = (int)Math.Ceiling((double)StartIndex / (double)PageSize) + 1;
                }
          
            }
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

    public interface IProductListingState
    {
        // int? CategoryId { get; set; }
        // NameValueCollection Facets { get; set; }
        int? PageSize { get; set; }
        string Query { get; set; }
        string SortBy { get; set; }
        int? StartIndex { get; set; }

        T Resolve<T>();
    }


    public class ProductSearchResult : ProductCollection
    {
        public override void Init(bool force = false, IProductListingState state = null)
        {
            if (state != null)
            {
                this.Query = state.Query;

            }

            base.Init(force, state);
        }

        [DataMember(EmitDefaultValue = false)] 
        public object Respell { get; set; }

        private bool? _hasValueFacets;

        public bool HasValueFacets
        {
            get
            {
                if (this.Facets == null || this.Facets.Count == 0)
                {
                    return false;
                }

                if (!_hasValueFacets.HasValue)
                {
                    _hasValueFacets = this.Facets.Any(x => x.FacetType == "Value");
                }

                return _hasValueFacets.Value;
            }
        }

        public string Query { get; set; }

        [DataMember(EmitDefaultValue = false)] 
        public virtual List<Facet> Facets { get; set; }

        public string SearchRedirect { get; set; }

        [DataMember(EmitDefaultValue = false)] 
        public Spellcheck Spellcheck { get; set; }

    }

    /// <summary>This collation comes from the SOLR response object</summary>
    public class CandidateCorrection
    {
        /// <summary>
        /// This is the corrected spelling of the original search term (e.g. "mountin" =&gt; "mountain")
        /// </summary>
        public string Query { get; set; }
    }
    
    public class Spellcheck
    {
        public List<CandidateCorrection> CandidateCorrections { get; set; }

        public bool AutoCorrected { get; set; }

        public string OriginalQuery { get; set; }

        public string CorrectedQuery { get; set; }
    }

    public class Facet : Mozu.ProductRuntime.Contracts.Facet
    {
          [DataMember]
        public virtual bool IsFaceted
        {
            get
            {
                if (this.Values == null || this.Values.Count == 0)
                {
                    return false;
                }

                return this.Values.Any(x => x.IsApplied.GetValueOrDefault(false));
            }
        }
    }

   
    public class ProductOption : Mozu.ProductRuntime.Contracts.ProductOption
    {
   
    }
    [DataContract]
    public class ProductContent : Mozu.ProductRuntime.Contracts.ProductContent
    {
        [System.Text.Json.Serialization.JsonIgnore]
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
                return ImageUrl ;
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
                    pi.ImageUrl = pi.ImageUrl + "?" + key;

                    return pi;
                }
            }
        }
    }
    public class ProductImageCollection: List<ProductImage>
    {
        public ProductImageCollection(IEnumerable<ProductImage> seed)
        {
            this.AddRange(seed);
        }

        public ProductImageCollection()
        {
        }

        public ProductImage Main
        {
            get { return this.FirstOrDefault(); }
        }
    }
    [DataContract]
    public class ProductCollection : Mozu.Core.Api.Contracts.PagedCollectionBase<Product>
    {
        
        int? _cP;
        [DataMember]
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

        private List<int> _middlePageNumbers;
        [DataMember]
        public List<int> MiddlePageNumbers
        {
            get
            {
                if (_middlePageNumbers == null)
                {
                    _middlePageNumbers = new List<int>();

                    var current = this.CurrentPage;
                    var pageCount = this.PageCount;
                    var i = Math.Max(Math.Min(current - 2, pageCount - 4), 2);
                    var last = Math.Min(i + 5, pageCount);
                    while (i < last)
                    {
                        _middlePageNumbers.Add(i++);
                    }
                }
                return _middlePageNumbers;
            }

        }


         [DataMember]
        public int FirstIndex
        {
            get
            {
                return this.StartIndex + 1;
            }
        }
         [DataMember]
        public int LastIndex
        {
            get
            {
                return this.StartIndex + (this.Items == null ? 0 : this.Items.Count);
            }
        }
         [DataMember]
        public bool HasPreviousPage
        {
            get
            {
                return this.StartIndex > 0;
            }
        }
         [DataMember]
        public bool HasNextPage
        {
            get
            {

                return this.LastIndex < this.TotalCount;
            }
        }

         [DataMember]
        public new int PageCount
        {
            get { return (int)base.PageCount; }
            set { base.PageCount = value; }
        }
         [DataMember]
        public int CurrentItemsPerPage { get; set; }
         [DataMember]
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
        public virtual void Init (bool force= false  , IProductListingState state = null )
        {
            if (!force && _inited)
            {
                return;
            }
            _inited = true;
            if (state != null)
            {
                CurrentSort = state.SortBy;
                StartIndex = state.StartIndex.GetValueOrDefault(StartIndex);
                PageSize = state.PageSize.GetValueOrDefault(PageSize);
                if (PageSize > 0)
                {
                    CurrentPage = (int)Math.Ceiling((double)StartIndex / (double)PageSize) + 1;
                }

            }
            InitCategories(state);
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
        void InitCategories(IProductListingState state = null)
        {
            if (state == null || this.Items == null)
            {
                return;
            }
            var catTreeProvider = state.Resolve<Mvc.Catalog.ICategoryTreeProvider>();
            if (catTreeProvider == null  )
            {
                return;
            }
         
            var catTree = catTreeProvider.GetAllCategories();
            this.Items.ForEach(prod =>
            {
                for (int idx = 0; idx < prod.Categories.Count; idx++)
                {
                    var oldCat = prod.Categories[idx];
                    prod.Categories[idx] = catTree.FindById(oldCat?.Id) ?? oldCat;
                }
            });
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

    public interface ICategoryTree
    {
        string ETag { get; set; }
        List<Category> Top { get; }
        List<Category> All { get;  }
        List<Category> RootCategories { get; }
        List<Category> AllCategories { get; set; }
        Category FindById( int? categoryId);
        Category FindByCode(string categoryCode);
        IList<Category> FindBySlug ( string categorySlug);
    }

    public class CategoryTree : ICategoryTree,  ITagFilterFindable
    {
      
    
        public string ETag { get; set; }

        List<Category> _rootCategories;
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public List<Category> RootCategories
        {
            get
            {
                if (_rootCategories == null )
                {
                    _rootCategories = AllCategories.Where(x => x.ParentCategoryId == null).OrderBy(x => x.Index).ToList();
                }
                return _rootCategories;
            }
            set { _rootCategories = value; }
        }


        Lazy<IDictionary<int, Category>> _allCategoriesIndexById;
        Lazy< IDictionary<string, Category>> _allCategoriesByCode;
       Lazy<ILookup<string, Category>> _allCategoriesBySlug;
        List<Category> _allCategories;


        public List<Category> All => AllCategories;
        
        public List<Category> Top => RootCategories;

        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public List<Category> AllCategories
        {
            get { return _allCategories; }
            set
            {
                _allCategories = value;
                if (value == null)
                {
                    return;
                }
                _allCategoriesIndexById =new  Lazy<IDictionary<int, Category>>(() => _allCategories.ToDictionary(x => x.Id.GetValueOrDefault(-1)));
                _allCategoriesByCode = new Lazy<IDictionary<string, Category>>(() => _allCategories.Where(x => !string.IsNullOrEmpty(x.CategoryCode)).ToDictionary(x => x.CategoryCode, StringComparer.OrdinalIgnoreCase));
                _allCategoriesBySlug = new Lazy<ILookup<string, Category>>(() => _allCategories.Where(x => x.Content != null && !string.IsNullOrEmpty(x.Content.Slug)).ToLookup(x => x.Content.Slug, StringComparer.OrdinalIgnoreCase));
            }
        }

        //todo:cole add JS export [Microsoft.ClearScript.ScriptMember("findById")]
        public Category FindById( int? categoryId)
        {
            if (!categoryId.HasValue)
            {
                return null;
            }
            Category cat;
            _allCategoriesIndexById.Value.TryGetValue(categoryId.Value, out cat);
            return cat;
        }
        //todo:cole add JS export [Microsoft.ClearScript.ScriptMember("findByCode")]
        public Category FindByCode(string categoryCode)
        {
            if( categoryCode == null)
            {
                return null;
            }
            Category cat;
            _allCategoriesByCode.Value.TryGetValue(categoryCode, out cat);
            return cat;
        }

        //todo:cole add JS export [Microsoft.ClearScript.ScriptMember("findBySlug")]
        public IList<Category> FindBySlug ( string categorySlug)
        {
            if (categorySlug == null)
            {
                return null;
            }

            return _allCategoriesBySlug.Value[categorySlug].ToList();
            
        }

        public object Filter(IEnumerable<object> parameters)
        {
            var token = parameters.FirstOrDefault();
            if (token == null)
            {
                return null;
            }
       
            if ( token is int || token is double || token is long)
            {
                return FindById(Convert.ToInt32(token));
            }
            object ret = null;
            if ( token is string )  
            {
                int intVal;
                if (int.TryParse((string)token, out intVal))
                {
                    ret = FindById(intVal);
                }
                return ret ?? FindByCode(token as string) ?? FindBySlug(token as string).FirstOrDefault();
                
            }
            return null;
        }
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
        [System.Text.Json.Serialization.JsonIgnore]
        public int? Index
        {
            get { return this.Sequence; }
            set {  }
        }
        [IgnoreDataMember()]
        [System.Text.Json.Serialization.JsonIgnore]
        public int? Id
        {
            get { return this.CategoryId; }
        }
        [IgnoreDataMember()]
        [System.Text.Json.Serialization.JsonIgnore]
        public string Name
        {
            get { return this.Content == null ? null : this.Content.Name; }
        }

        int? _parentCategory = null;
        [DataMember(EmitDefaultValue = false, Order = 5)]
        public int? ParentCategoryId
        {
            get
            {
                return _parentCategory.HasValue ? _parentCategory : (this.ParentCategory != null ? (int?)this.ParentCategory.CategoryId : (int?)null);
            }
            set
            {
                _parentCategory = value;
            }
        }

        [IgnoreDataMember()]
        [System.Text.Json.Serialization.JsonIgnore]
        public new  Category ParentCategory { get; set; }

        private string _url;
         [DataMember(EmitDefaultValue = false)]
        public string Url
        {
             get
             {
                 if (_url == null)
                 {
                     _url = (Content == null || string.IsNullOrEmpty(Content.Slug)) ? "/c/" + Id : "/" + Content.Slug + "/c/" + CategoryId;
                 }
                 return _url;
             }
        }
       

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
        [DataMember]
        public bool OnSale
        {
            get { return this.SalePrice.HasValue && this.Price.HasValue && this.SalePrice.Value != this.Price.Value; }
        }
    }

    public class ProductVolumePrice : Mozu.ProductRuntime.Contracts.ProductVolumePrice
    {

        [DataMember]
        public virtual new ProductPriceRange PriceRange { get; set; }

        [DataMember]
        public virtual new ProductPrice Price { get; set; }

    }


}


namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public interface ICategoryTreeProvider
    {
        Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.CategoryTree GetAllCategories();
        Task<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.CategoryTree> GetAllCategoriesAsync();
        bool HasCompleted { get; }
    }
}