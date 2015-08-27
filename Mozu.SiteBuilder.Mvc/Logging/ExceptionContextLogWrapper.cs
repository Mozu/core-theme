using System;
using System.Diagnostics;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// The ILogger factory depends on constructor injection to properly assign [LoggingContextProvider]s.
    /// Exceptions caught in threads that do not have the synchronization context can use the container 
    /// to resolve this wrapper.
    /// </summary>
    public sealed class ExceptionContextLogWrapper
    {
        private ILogger _logger;
        private ISiteBuilderApiContext _apiContext;

        public ExceptionContextLogWrapper(ILogger logger, ISiteBuilderApiContext apiContext)
        {
            _logger = logger;
            _apiContext = apiContext;
        }

        public ILogger GetLogger()
        {
            return _logger;
        }

        public string GetCorrelationId()
        {
            if (Trace.CorrelationManager.ActivityId != Guid.Empty)
                return Trace.CorrelationManager.ActivityId.ToString("N");
            else if (_apiContext != null && _apiContext.TraceContext != null)
                return _apiContext.TraceContext.CorrelationId;
            
            return null;
        }
    }
}
