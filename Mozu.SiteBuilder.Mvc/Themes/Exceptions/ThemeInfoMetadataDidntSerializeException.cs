using System;

namespace Mozu.SiteBuilder.Mvc.Themes.Exceptions
{
    internal class ThemeInfoMetadataDidntSerializeException : Exception
    {
        public ThemeInfoMetadataDidntSerializeException(string message, Exception innerException) : base(message, innerException) { }
    }
}
