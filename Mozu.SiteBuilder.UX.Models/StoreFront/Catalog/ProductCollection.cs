// -----------------------------------------------------------------------
// <copyright file="ProductCollection.cs" company="Microsoft">
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
    public class ProductCollection : ModelBase
    {
        
        public List<Product> Items
        {
            get;
            set;
        }
        public PagingModel Paging
        {
            get;
            set;
        }



        

       
    }
    public class PagingModel : ModelBase
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
    public class RepeaterItem:ModelBase
    {
        public string Text{get;set;}
        public string Url { get; set; }
        public object Value{get;set;}
        public bool Selected {get;set;}
    }
}
