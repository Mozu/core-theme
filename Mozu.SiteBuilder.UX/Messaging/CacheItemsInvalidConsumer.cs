using Burrows;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts;
using Mozu.Core.Messaging.Contracts.Product.Events;
using Mozu.Core.Messaging.Contracts.Search.Events;
using Mozu.SiteBuilder.Mvc.Caching;

namespace Mozu.SiteBuilder.UX.Messaging
{
    //TODO: cache invalidation by tags, so we can only kill subsets of ALL THE THINGS.
    public class CacheItemsInvalidConsumer : LoggingConsumer, 
        Consumes<IProductEvent>.All, 
        Consumes<ICategoryEvent>.All,
        Consumes<IDiscountEvent>.All,
        Consumes<ISearchIndexUpdated>.All,
        Consumes<IFacetEvent>.All,
        Consumes<ISearchTuningRuleEvent>.All,
        Consumes<ISearchSettingsEvent>.All
    {
        private readonly IStorefrontCacheControl _storefrontCacheControl;

        public CacheItemsInvalidConsumer(IStorefrontCacheControl storefrontCacheControl)
        {
            _storefrontCacheControl = storefrontCacheControl;
        }

        public void Consume(IFacetEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        public void Consume(ISearchSettingsEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        public void Consume(ISearchTuningRuleEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        public void Consume(IProductEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        public void Consume(ICategoryEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        public void Consume(IDiscountEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        //TODO: update when we have the new solr enqueue messaging
        public void Consume(ISearchIndexUpdated message)
        {
            InvalidateMessageOnCatalogAndSite(message, _storefrontCacheControl);
        }

        static void InvalidateMessageOnCatalogAndSite<T>(T message, IStorefrontCacheControl cacheControl) where T : IMessage
        {
            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                cacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId, message.MessagePublishingContext.CatalogId.Value);
            }
            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                cacheControl.InvalidateSite(message.MessagePublishingContext.SiteId.Value);
            }
        }


    }
}
