using System;

namespace Mozu.SiteBuilder.Mvc.Themes.Exceptions
{
    public class ThemeNotFoundException : Exception
    {
        private Theme Context { get; set; }
        public ThemeNotFoundException(string message) : base(message) { }
        public ThemeNotFoundException(string message, Exception innerException) : base(message, innerException) { }
        internal ThemeNotFoundException(string message, Theme context) : base(message) { Context = context; }
        internal ThemeNotFoundException(string message, Theme context, Exception innerException) : base(message, innerException) { Context = context; }
    }
}
