using System;

namespace Mozu.SiteBuilder.Mvc.Theme.Exceptions
{
    internal class DuplicateThemeNameException : Exception
    {
        public DuplicateThemeNameException(string themeName) : base("Attempted to add two themes with the same name: " + themeName) { }
    }
}
