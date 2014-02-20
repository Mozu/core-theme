using System;
using Burrows;
using Mozu.Core.Messaging.Contracts;

namespace Mozu.SiteBuilder.UX.Messaging
{
    public class CacheItemsInvalidConsumer : Consumes<IEntityEvent>.Selected
    {
        /// <summary>
        /// Accepts or ignores messages before they are consumed by us.
        /// </summary>
        public bool Accept(IEntityEvent message)
        {
            return true;
        }

        public void Consume(IEntityEvent message)
        {
            throw new NotImplementedException();
        }
    }
}
