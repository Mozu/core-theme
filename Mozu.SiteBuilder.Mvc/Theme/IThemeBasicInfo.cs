using System;

namespace Mozu.SiteBuilder.Mvc.Theme
{
    /// <summary>
    /// Contains basic information about a Theme.
    /// </summary>
    public interface IThemeBasicInfo
    {
        /// <summary>
        /// Contains this theme's name.
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Contains this theme's author.
        /// </summary>
        string Author { get; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for desktop display.
        /// </summary>
        bool IsDesktop { get; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for mobile display.
        /// </summary>
        bool IsMobile { get; }

        /// <summary>
        /// Contains the thumbnail for this theme or null.
        /// </summary>
        Thumbnail Thumbnail { get; set; }
    }
}
