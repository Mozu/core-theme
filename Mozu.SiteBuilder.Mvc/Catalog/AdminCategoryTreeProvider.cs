using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Context;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class AdminCategoryTreeProvider : RuntimeCategoryTreeProvider
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public AdminCategoryTreeProvider(ISiteBuilderContextProvider provider)
            : base(provider)
        {
        }

       
    }
   
}