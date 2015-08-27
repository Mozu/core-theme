using System;

namespace Mozu.SiteBuilder.Mvc.Themes.Exceptions
{
    public class ThemeInheritanceRecursionException : Exception
    {
        public ThemeInheritanceRecursionException(string message)
            : base(message)

        {
        }
    }
}
