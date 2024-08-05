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
using System.Threading;
using MassTransit;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Mozu.SiteBuilder.UX.Messaging
{
    public class SiteBuilderContextInvalidatorConsumer : LoggingConsumer,
        IConsumer<ICategoryEvent>,
        IConsumer<IDocumentChanged>,
        IConsumer<ISiteSettingsEvent>
    {
        private readonly ISitebuilderContextCacheRepository _sitebuilderContextCacheRepository;
        private readonly ConcurrentDictionary<string, MessagePublishingContext> _messageDebounceCol = new ConcurrentDictionary<string, MessagePublishingContext>();
        
        private Task _drainTask;

        public SiteBuilderContextInvalidatorConsumer(ILoggerFactory loggerFactory,   ISitebuilderContextCacheRepository sitebuilderContextCacheRepository):base(loggerFactory)
        {
            _sitebuilderContextCacheRepository = sitebuilderContextCacheRepository;
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
                   kvp.Value.MasterCatalogId.GetValueOrDefault(),
                   kvp.Value.CatalogId.GetValueOrDefault(),
                   kvp.Value.SiteId,
                   kvp.Value.LocaleCode ,
                   kvp.Value.CurrencyCode ,
                   kvp.Value.DataViewMode.HasValue ?
                   (DataViewModeType)kvp.Value.DataViewMode.Value :
                   DataViewModeType.NoneSet
               );
            }
        }

        void InvalidateMessageOnCatalogAndSite<T>(T message,  DataViewModeType dataModeType) where T : IEventMessage
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
                _drainTask ??= Task.Run(() => Task.Delay(3000).ContinueWith(_ => Drain()));
            }
        }

        public Task Consume(ConsumeContext<ICategoryEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, 
                DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<IDocumentChanged> context)
        {
            var mode = DataViewModeType.NoneSet;
            var message = context.Message;

            

            if (
                string.IsNullOrEmpty(message.DocumentListName) ||
                string.Equals(message.DocumentListName, "pages@mozu", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(message.DocumentListName, "siteSettings@mozu", StringComparison.OrdinalIgnoreCase)
            )
            {
                InvalidateMessageOnCatalogAndSite(message,  mode);
            }
            return Task.CompletedTask;
        }

        public Task Consume(ConsumeContext<ISiteSettingsEvent> context)
        {
            InvalidateMessageOnCatalogAndSite(context.Message, DataViewModeType.NoneSet);
            return Task.CompletedTask;
        }

       
    }
    
    
    public class  BusService :IHostedService
    {
        private readonly IBusControl _busControl;

        public BusService(IBusControl busControl)
        {
            _busControl = busControl;
        }
        public Task StartAsync(CancellationToken cancellationToken)
        {
            return _busControl.StartAsync(cancellationToken);
        }
        
        public Task StopAsync(CancellationToken cancellationToken)
        {
            return _busControl.StopAsync(cancellationToken);
        }
    }

    
}
