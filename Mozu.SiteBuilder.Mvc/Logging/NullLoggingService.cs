using System;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// This class provides a <code>NullLogger</code> when requested.
    /// </summary>
    public sealed class NullLoggingService : ILoggingService
    {
        private ILogger _nullLogger;

        public NullLoggingService()
        {
            _nullLogger = new NullLogger();
        }

        public ILogger LoggerFor(Type type)
        {
            return _nullLogger;
        }

        public ILogger LoggerFor(string loggerName)
        {
            return _nullLogger;
        }

        public ILogger LoggerFor<T>()
        {
            return _nullLogger;
        }
    }
}
