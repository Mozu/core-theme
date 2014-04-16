using System;
using Autofac;
using Burrows;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts;
using Mozu.SiteBuilder.Mvc.Caching;

namespace Mozu.SiteBuilder.UX.Messaging
{

    public class CacheItemsInvalidConsumer : LoggingConsumer, 
        Consumes<Mozu.Core.Messaging.Contracts.Product.Events.IProductEvent >.All, 
        Consumes<Mozu.Core.Messaging.Contracts.Product.Events.ICategoryEvent>.All,
        Consumes<Mozu.Core.Messaging.Contracts.Product.Events.IDiscountEvent>.All
   
    {
        private readonly IStorefrontCacheControl _storefrontCacheControl;


        public CacheItemsInvalidConsumer(IStorefrontCacheControl storefrontCacheControl)
        {
            _storefrontCacheControl = storefrontCacheControl;
           // int f = 0;
            //_storefrontCacheControl = StorefrontCacheControlImpl.Default;
        }

        public void Consume(Core.Messaging.Contracts.Product.Events.IProductEvent message)
        {
            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                _storefrontCacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId, message.MessagePublishingContext.CatalogId.Value);
            }
            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                 _storefrontCacheControl.InvalidateSite( message.MessagePublishingContext.SiteId.Value);
            }
            
           
        }

        public void Consume(Core.Messaging.Contracts.Product.Events.ICategoryEvent message)
        {
            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                _storefrontCacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId, message.MessagePublishingContext.CatalogId.Value);
            }
            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                _storefrontCacheControl.InvalidateSite(message.MessagePublishingContext.SiteId.Value);
            }
        }

        public void Consume(Core.Messaging.Contracts.Product.Events.IDiscountEvent message)
        {
            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                _storefrontCacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId, message.MessagePublishingContext.CatalogId.Value);
            }
            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                _storefrontCacheControl.InvalidateSite(message.MessagePublishingContext.SiteId.Value);
            }
        }

    }
    //public class CacheItemsInvalidConsumer : LoggingConsumer, Consumes<IEntityEvent>.All
    //{
    //    public void Consume(IEntityEvent message)
    //    {
    //        ProcessWithLogging(() =>
    //        {
    //            // do some processing.
    //        }, message);
    //    }
    //}
}
