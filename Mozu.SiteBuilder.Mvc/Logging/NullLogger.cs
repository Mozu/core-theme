using System;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// This class does nothing with log messages.
    /// It implements the ILogger interface to satisfy dependency injection.
    /// </summary>
    internal sealed class NullLogger : ILogger
    {
        public void Debug(Func<string> formatterDelegate, object properties = null)
        {
        }

        public void Debug(object message, Exception ex, object properties = null)
        {
        }

        public void Debug(object message, object properties = null)
        {
        }

        public void Error(Func<string> formatterDelegate, object properties = null)
        {
        }

        public void Error(object message, Exception ex, object properties = null)
        {
        }

        public void Error(object message, object properties = null)
        {
        }

        public void Fatal(Func<string> formatterDelegate, object properties = null)
        {
        }

        public void Fatal(object message, Exception ex, object properties = null)
        {
        }

        public void Fatal(object message, object properties = null)
        {
        }

        public void Info(Func<string> formatterDelegate, object properties = null)
        {
        }

        public void Info(object message, Exception ex, object properties = null)
        {
        }

        public void Info(object message, object properties = null)
        {
        }

        public void Warn(Func<string> formatterDelegate, object properties = null)
        {
        }

        public void Warn(object message, Exception ex, object properties = null)
        {
        }

        public void Warn(object message, object properties = null)
        {
        }
    }
}
