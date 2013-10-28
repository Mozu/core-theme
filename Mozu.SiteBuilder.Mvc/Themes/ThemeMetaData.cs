using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Information about a theme loaded directly from the filesystem.
    /// An instance of this class is passed into ThemeFactory to make a Theme.
    /// </summary>
    internal class ThemeMetaData
    {
        public string Id { get; set; }
        public string ThemePath { get; set; }
        public ThemeConfiguration Configuration { get; set; }
        public Thumbnail Thumbnail { get; set; }
        
     

        public ThemeFileSystemInfo[] FileListing { get; set; }
    }
}
