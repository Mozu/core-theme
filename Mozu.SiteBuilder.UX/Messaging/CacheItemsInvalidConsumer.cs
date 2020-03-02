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
        Consumes<ICategoryEvent>.All,
        Consumes<IDocumentChanged>.All,
        Consumes<IGeneralSettingsUpdated>.All,
        Consumes<ICheckoutSettingsUpdated>.All
    {
        ISitebuilderContextCacheRepository _sitebuilderContextCacheRepository;
        ConcurrentDictionary<string, MessagePublishingContext> _messageDebounceCol = new ConcurrentDictionary<string, MessagePublishingContext>();
        Task _drainTask;
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



        HashSet<string> _productGenericTopics = new HashSet<string> {
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductDraftPublished().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountExpired().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductInventoryInStock().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductInventoryOutOfStock().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetDeleted().Topic,
        };

        public void Consume(IProductEvent message)
        {
            if (_productGenericTopics.Contains(message.Topic))
            {
                InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
            }
            else
            {
                InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.Pending);
            }


        }

        public void Consume(ICategoryEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
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



        void InvalidateMessageOnCatalogAndSite<T>(T message, StoreFrontCacheDependencies cacheDepType, Mozu.Core.DataViewModeType dataModeType) where T : IEventMessage
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

        public void Consume(IDocumentChanged message)
        {
            var mode =DataViewModeType.NoneSet;

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

            
        }

        public void Consume(IGeneralSettingsUpdated message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.None, DataViewModeType.NoneSet);
        }

        public void Consume(ICheckoutSettingsUpdated message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.None, DataViewModeType.NoneSet);
        }
    }

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

       

        HashSet<string> _productGenericTopics = new HashSet<string> {
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductDraftPublished().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.CategoryCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountDeleted().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountExpired().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.DiscountUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductInventoryInStock().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.ProductInventoryOutOfStock().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetCreated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetUpdated().Topic,
            new Mozu.Core.Messaging.Contracts.Product.Events.FacetDeleted().Topic,
        };
        
        public void Consume(IProductEvent message)
        {
            if (_productGenericTopics.Contains(message.Topic))
            {
                InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
            }
            else
            {
                InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.Pending);
            }
            
           
        }

        public void Consume(ICategoryEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }

        public void Consume(IDiscountEvent message)
        {
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, DataViewModeType.NoneSet);
        }

        //TODO: update when we have the new solr enqueue messaging
        public void Consume(ISearchIndexUpdated message)
        {


            var dvm =(DataViewModeType) message.MessagePublishingContext.DataViewMode.GetValueOrDefault((int)DataViewModeType.NoneSet);
          
            //todo update when kevin figures out how to tell us if its a staging or live event.
            InvalidateMessageOnCatalogAndSite(message, StoreFrontCacheDependencies.Catalog, dvm);
    
        }
      

    

         void InvalidateMessageOnCatalogAndSite<T>(T message, StoreFrontCacheDependencies cacheDepType, Mozu.Core.DataViewModeType dataModeType) where T : IEventMessage
        {
            //StorefrontCacheTypes cacheType, Mozu.Core.DataViewModeType dataModeType

            if (message.MessagePublishingContext.CatalogId.HasValue)
            {
                _storefrontCacheControl.InvalidateCatalog(message.MessagePublishingContext.TenantId, message.MessagePublishingContext.CatalogId.Value, cacheDepType, dataModeType);
            }
            if (message.MessagePublishingContext.SiteId.HasValue)
            {
                _storefrontCacheControl.InvalidateSite(message.MessagePublishingContext.SiteId.Value, cacheDepType,dataModeType);
            }
        }
    }
}
