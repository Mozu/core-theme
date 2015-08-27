using System;

namespace Mozu.SiteBuilder.Mvc.Themes.Exceptions
{
    internal class ThemeSettingsConfigurationDidntSerializeException : Exception
    {
        public ThemeSettingsConfigurationDidntSerializeException(string message, Exception innerException) : base(message, innerException) { }
    }
}
