using System;
using System.Threading;
using Microsoft.Extensions.Caching.Memory;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public class OutOfMemoryHandler : Mozu.Core.Exceptions.IOutOfMemoryExceptionsHandler
    {
        private MemoryCache _cache;
        static DateTime _lastRun = DateTime.UnixEpoch;
        static System.Threading.SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public OutOfMemoryHandler(IMemoryCache memoryCache)
        {
            _cache = memoryCache as MemoryCache;
        }

        public void HandlerOom(Exception ex)
        {
            if (_cache == null)
            {
                return;
            }
            if (_semaphore.CurrentCount == 0 || (DateTime.Now - _lastRun).TotalSeconds < 60)
            {
                return;
            }
            var gotIt = _semaphore.Wait(10000);
            if (!gotIt)
            {
                return;
            }
            try
            {
                _cache.Compact(.8);
                _lastRun = DateTime.Now;
            }
            finally
            {
                _semaphore.Release();
            }
        }

    }
}