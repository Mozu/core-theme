using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public class ThemeLabelCollection : Dictionary<string, string>
    {
        public ThemeLabelCollection() : base(StringComparer.OrdinalIgnoreCase)
        {
        }
    }
}
