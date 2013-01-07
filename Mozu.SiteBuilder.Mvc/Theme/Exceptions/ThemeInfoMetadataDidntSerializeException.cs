using System;

namespace Mozu.SiteBuilder.Mvc.Theme.Exceptions
{
    internal class ThemeInfoMetadataDidntSerializeException : Exception
    {
        public ThemeInfoMetadataDidntSerializeException(string message, Exception innerException) : base(message, innerException) { }
    }
}
