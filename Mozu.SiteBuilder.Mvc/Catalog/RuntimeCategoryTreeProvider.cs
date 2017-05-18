using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Caching;
using Category = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;
using Mozu.SiteBuilder.Mvc.Context;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class RuntimeCategoryTreeProvider : ICategoryTreeProvider
    {

        Task<CategoryTree> _categoryTreeTask;
        ISiteBuilderContextProvider _contextProvider;

        public RuntimeCategoryTreeProvider(ISiteBuilderContextProvider contextProvider)
        {
            _contextProvider = contextProvider;
           
        }

        public bool HasCompleted
        {
            get
            {
                return true;
            }
        }
        CategoryTree _catTree;
        public CategoryTree GetAllCategories()
        {
            return _catTree ?? (_catTree = GetAllCategoriesImpl());
        }
        public Task<CategoryTree> GetAllCategoriesAsync()
        {
            return _categoryTreeTask ?? (_categoryTreeTask = Task.FromResult(GetAllCategoriesImpl()));
        }

        CategoryTree GetAllCategoriesImpl()
        {
            var data = _contextProvider.GetContextData();
            return new CategoryTree() {
                AllCategories = data.GetFlatCategoryList(),
                ETag = data.Hash
            };
        }

        

    }
        
    
    
}
