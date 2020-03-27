using System.Collections.Generic;
using Mozu.Core;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts;
using Mozu.Core.Messaging.Contracts.Product.Events;
using Mozu.Core.Messaging.Contracts.Search.Events;
using Mozu.Core.Messaging.Contracts.Content.Events;
using Mozu.Core.Messaging.Contracts.SiteSettings.Events;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Context;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using System;
using MassTransit;

namespace Mozu.SiteBuilder.UX.Messaging
{
    public class SiteBuilderContextInvalidatorConsumer : LoggingConsumer,
        IConsumer<ICategoryEvent>,
        IConsumer<IDocumentChanged>,
        IConsumer<IGeneralSettingsUpdated>,
        IConsumer<ICheckoutSettingsUpdated>
    {
        private readonly ISitebuilderContextCacheRepository _sitebuilderContextCacheRepository;
        private readonly ConcurrentDictionary<string, MessagePublishingContext> _messageDebounceCol = new ConcurrentDictionary<string, MessagePublishingContext>();
        private readonly HashSet<string> _productGenericTopics = new HashSet<string> {
            new ProductCreated().Topic,
            new ProductDeleted().Topic,
            new ProductDraftPublished().Topic,
            new ProductUpdated().Topic,
            new CategoryUpdated().Topic,
            new CategoryDeleted().Topic,
            new CategoryCreated().Topic,
            new DiscountCreated().Topic,
            new DiscountDeleted().Topic,
            new DiscountExpired().Topic,
            new DiscountUpdated().Topic,
            new ProductInventoryInStock().Topic,
            new ProductInventoryOutOfStock().Topic,
            new FacetCreated().Topic,
            new FacetUpdated().Topic,
            new FacetDeleted().Topic,
        };
        private Task _drainTask;
        //System.Threading.Timer _drainTimer;

        public SiteBuilderContextInvalidatorConsumer(ISitebuilderContextCacheRepository sitebuilderContextCacheRepository)
        {
            _sitebuilderContextCacheRepository = sitebuilderContextCacheRepository;
        }

        public void Consume(IFacetEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }

        public void Consume(ISearchSettingsEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }

        public void Consume(ISearchTuningRuleEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }


        public void Consume(IProductEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog,
                _productGenericTopics.Contains(message.Topic) ? 
                    DataViewModeType.NoneSet : 
                    DataViewModeType.Pending);
        }

        public void Consume(IDiscountEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }

        //TODO: update when we have the new solr enqueue messaging
        public void Consume(ISearchIndexUpdated message)
        {
            var dvm = (DataViewModeType)message.MessagePublishingContext.DataViewMode.GetValueOrDefault((int)DataViewModeType.NoneSet);

            //todo update when kevin figures out how to tell us if its a staging or live event.
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, dvm);
        }

        void Drain ()
        {
            lock (this)
            {
                _drainTask = null;
            }
            
            var work = new Dictionary<string, MessagePublishingContext>(_messageDebounceCol);

            foreach( var kvp in work)
            {
                _messageDebounceCol.TryRemove(kvp.Key, out var temp);
               
                _sitebuilderContextCacheRepository.Invalidate(kvp.Value.TenantId,
                   kvp.Value.MasterCatalogId.Value,
                   kvp.Value.CatalogId.Value,
                   kvp.Value.SiteId,
                   kvp.Value.LocaleCode ,
                   kvp.Value.CurrencyCode ,
                   kvp.Value.DataViewMode.HasValue ?
                   (DataViewModeType)kvp.Value.DataViewMode.Value :
                   DataViewModeType.NoneSet
               );
            }
        }

        void InvalidateMessageOnCatalogAndSite<T>(T message, StoreFrontCacheDependencies cacheDepType, DataViewModeType dataModeType) where T : IEventMessage
        {
            if (message.MessagePublishingContext.CatalogId.HasValue == false)
            {
                return;
            }
            message.MessagePublishingContext.DataViewMode = (int?)dataModeType;
            var key = string.Join(";", message.MessagePublishingContext.TenantId,
                message.MessagePublishingContext.TenantId,
                message.MessagePublishingContext.MasterCatalogId.Value,
                message.MessagePublishingContext.CatalogId.Value,
                message.MessagePublishingContext.SiteId,
                message.MessagePublishingContext.DataViewMode.HasValue ?
                (DataViewModeType)message.MessagePublishingContext.DataViewMode.Value :
                DataViewModeType.NoneSet);
            _messageDebounceCol[key] = message.MessagePublishingContext;
            lock(this)
            {
                if (_drainTask== null)
                {
                    _drainTask =  Task.Run(() => Task.Delay(1000).ContinueWith(_ => Drain()));
                }
            }
        }

        public Task Consume(ConsumeContext<ICategoryEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<IDocumentChanged> context)
        {
            var mode = DataViewModeType.NoneSet;
            var message = context.Message;

            //bug in content sends pending for live edits.   uncomment when fixed.
            //if ( message.DataViewMode == DataViewModeType.Pending.ToString())
            //{
            //    mode = DataViewModeType.Pending;
            //}

            if (
                string.IsNullOrEmpty(message.DocumentListName) ||
                string.Equals(message.DocumentListName, "pages@mozu", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(message.DocumentListName, "siteSettings@mozu", StringComparison.OrdinalIgnoreCase)
            )
            {
                InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.None, mode);
            }
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<IGeneralSettingsUpdated> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.None, DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ICheckoutSettingsUpdated> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.None, DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }
    }

    //TODO: cache invalidation by tags, so we can only kill subsets of ALL THE THINGS.
    public class CacheItemsInvalidConsumer : LoggingConsumer,
        IConsumer<IProductEvent>,
        IConsumer<ICategoryEvent>,
        IConsumer<IDiscountEvent>,
        IConsumer<ISearchIndexUpdated>,
        IConsumer<IFacetEvent>,
        IConsumer<ISearchTuningRuleEvent>,
        IConsumer<ISearchSettingsEvent>
    {
        private readonly IStorefrontCacheControl _storefrontCacheControl;

        private readonly HashSet<string> _productGenericTopics = new HashSet<string>
        {
            new ProductCreated().Topic,
            new ProductDeleted().Topic,
            new ProductDraftPublished().Topic,
            new ProductUpdated().Topic,
            new CategoryUpdated().Topic,
            new CategoryDeleted().Topic,
            new CategoryCreated().Topic,
            new DiscountCreated().Topic,
            new DiscountDeleted().Topic,
            new DiscountExpired().Topic,
            new DiscountUpdated().Topic,
            new ProductInventoryInStock().Topic,
            new ProductInventoryOutOfStock().Topic,
            new FacetCreated().Topic,
            new FacetUpdated().Topic,
            new FacetDeleted().Topic,
        };

        public CacheItemsInvalidConsumer(IStorefrontCacheControl storefrontCacheControl)
        {
            _storefrontCacheControl = storefrontCacheControl;
        }

        void InvalidateMessageOnCatalogAndSite<T>(T message, StoreFrontCacheDependencies cacheDepType,
            DataViewModeType dataModeType) where T : IEventMessage
        {
            //StorefrontCacheTypes cacheType, Mozu.Core.DataViewModeType dataModeType

            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                _storefrontCacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId,
                    message.MessagePublishingContext.CatalogId.Value, cacheDepType, dataModeType);
            }

            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                _storefrontCacheControl.InvalidateSite(message.MessagePublishingContext.SiteId.Value, cacheDepType,
                    dataModeType);
            }
        }

        public Task Consume(ConsumeContext<IProductEvent> context)
        {
            var message = context.Message;
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog,
                _productGenericTopics.Contains(message.Topic) ? DataViewModeType.NoneSet : DataViewModeType.Pending);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ICategoryEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<IDiscountEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ISearchIndexUpdated> context)
        {
            var dvm = (DataViewModeType) context.Message.MessagePublishingContext.DataViewMode.GetValueOrDefault(
                (int) DataViewModeType.NoneSet);

            //todo update when kevin figures out how to tell us if its a staging or live event.
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog, dvm);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<IFacetEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ISearchTuningRuleEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ISearchSettingsEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, StoreFrontCacheDependencies.Catalog,
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }
    }
}
