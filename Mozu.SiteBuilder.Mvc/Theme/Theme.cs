using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Theme
{
    /// <summary>
    /// Internal class implementing an IThemeInfo.
    /// </summary>
    internal class Theme : ITheme, IThemeBasicInfo
    {
        /// <summary>
        /// Contains this theme's name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Obsolete. Returns this theme's name.
        /// </summary>
        public string Id { get { return this.Name; } }

        /// <summary>
        /// Contains this theme's author.
        /// </summary>
        public string Author { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for desktop display.
        /// </summary>
        public bool IsDesktop { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for mobile display.
        /// </summary>
        public bool IsMobile { get; set; }

        /// <summary>
        /// If this theme inherits from another theme, contains the inherited theme.
        /// </summary>
        public ITheme Parent { get; set; }

        /// <summary>
        /// Contains the thumbnail for this theme or null.
        /// </summary>
        public Thumbnail Thumbnail { get; set; }

        /// <summary>
        /// Returns a complete theme inheritance stack with this theme as the first.
        /// For legacy reasons, this property actually returns the theme names.
        /// </summary>
        public ICollection<string> Stack { 
            get {
                return StackT.Select(t => t.Name).ToArray();
            }
        }

        /// <summary>
        /// Returns a complete theme inheritance stack with this theme as the first.
        /// </summary>
        public ICollection<ITheme> StackT
        {
            get
            {
                LinkedList<ITheme> stack = new LinkedList<ITheme>(new [] { this });

                ITheme parent = this.Parent;
                while (parent != null)
                {
                    stack.AddLast(parent);

                    // we call this next line a parent trap
                    parent = parent.Parent;
                }

                return stack;
            }
        }

        /// <summary>
        /// Contains the theme configuration object.
        /// </summary>
        public IEnumerable<ConfigurationItem> Configuration { get; set; }


        /// <summary>
        /// Used by ThemeInfoFactory.
        /// </summary>
        public string InheritanceString { get; set; }

        /// <summary>
        /// Used by ThemeInfoFactory.
        /// </summary>
        public bool IsInitialized { get; set; }

        /// <summary>
        /// Gets the theme configuration information for this theme only (none of its ancestors).
        /// Used by ThemeInfoFactory and ThemeConfigurationFactory.
        /// </summary>
        public IEnumerable<ConfigurationItem> NodeConfiguration { get; set; }

        /// <summary>
        /// Internal constructor.
        /// This class is intended to be initalized only by ThemeFactory.
        /// </summary>
        internal Theme() {}
    }
}
