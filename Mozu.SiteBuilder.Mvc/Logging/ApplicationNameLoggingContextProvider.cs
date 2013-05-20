using System;
using System.Collections.Generic;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// Decorates the Mozu Logging factory with a context provider
    /// that adds ApplicationName to every log event.
    /// </summary>
    public class ApplicationNameLoggingContextProvider : ILoggingContextProvider
    {
        private string _applicationName;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ApplicationNameLoggingContextProvider(string applicationName)
        {
            _applicationName = applicationName;
        }

        /// <summary>
        /// Implements ILoggingContextProvider.
        /// </summary>
        public IDictionary<string, object> GetProperties()
        {
            return new Dictionary<string, object> {{ "ApplicationName", _applicationName }};
        }
    }
}
