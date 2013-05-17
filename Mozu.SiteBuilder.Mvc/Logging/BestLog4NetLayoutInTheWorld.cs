using System;
using System.IO;
using log4net.Core;
using log4net.Layout;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    public class BestLog4NetLayoutInTheWorld : SimpleLayout
    {
        public override void Format(TextWriter writer, LoggingEvent loggingEvent)
        {
            if (loggingEvent == null)
                throw new ArgumentNullException("loggingEvent");

            var apiContext = loggingEvent.Properties["ApiContext"] as ApiContext;

            if (apiContext != null)
            {
                writer.Write(loggingEvent.Level.DisplayName);
                writer.Write(" - ");

                loggingEvent.WriteRenderedMessage(writer);

                writer.Write("[tenant " + apiContext.TenantId + "]");
                writer.Write("[site " + apiContext.SiteId + "]");
                writer.Write("[" + loggingEvent.Properties["ActivityId"] + "]");

                writer.WriteLine();
            }
            else
            {
                base.Format(writer, loggingEvent);
            }
        }
    }
}