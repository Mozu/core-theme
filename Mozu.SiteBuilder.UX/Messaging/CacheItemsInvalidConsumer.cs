using System;
using Burrows;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts;

namespace Mozu.SiteBuilder.UX.Messaging
{
    public class CacheItemsInvalidConsumer : LoggingConsumer, Consumes<IEntityEvent>.All
    {
        public void Consume(IEntityEvent message)
        {
            ProcessWithLogging(() => {
                // do some processing.
            }, message);
        }
    }
}
