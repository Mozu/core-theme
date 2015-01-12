using Burrows;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts;
using Mozu.Core.Messaging.Contracts.Product.Events;
using Mozu.SiteBuilder.Mvc.Caching;

namespace Mozu.SiteBuilder.UX.Messaging
{
    //TODO: cache invalidation by tags, so we can only kill subsets of ALL THE THINGS.
    public class CacheItemsInvalidConsumer : LoggingConsumer, 
        Consumes<IProductEvent>.All, 
        Consumes<ICategoryEvent>.All,
        Consumes<IDiscountEvent>.All,
        Consumes<CacheItemsInvalidConsumer.ISolrEnqueue>.All
   
    {
        private readonly IStorefrontCacheControl _storefrontCacheControl;

        public CacheItemsInvalidConsumer(IStorefrontCacheControl storefrontCacheControl)
        {
            _storefrontCacheControl = storefrontCacheControl;
        }

        public void Consume(IProductEvent message)
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

        public void Consume(ICategoryEvent message)
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

        public void Consume(IDiscountEvent message)
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

        //TODO: update when we have the new solr enqueue messaging
        public void Consume(ISolrEnqueue message)
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

        public interface ISolrEnqueue : IEntityEvent
        {
            
        }
    }
}
