using System;

namespace Mozu.SiteBuilder.Mvc.Theme.Exceptions
{
    internal class ThemeSettingsConfigurationDidntSerializeException : Exception
    {
        public ThemeSettingsConfigurationDidntSerializeException(string message, Exception innerException) : base(message, innerException) { }
    }
}
