using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

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
        public AdminCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, ILogger logger)
            : base(productCategoryRuntimeWebApiClient, logger)
        {
        }

       
    }
}
