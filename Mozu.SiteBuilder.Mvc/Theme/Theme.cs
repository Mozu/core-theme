using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Internal class implementing an IThemeInfo.
    /// </summary>
    public  class Theme 
    {
        /// <summary>
        /// Contains this theme's name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Id. Returns this theme's Id.
        /// </summary>
        public string Id { get; set; }


        public List<Models.CMS.PageTemplateDefinition> PageTypes { get; set; }

        public List<Models.CMS.WidgetDefinition> Widgets { get; set; }

        public ThemeFileSystemInfo[] FileListing { get; set; }



        /// <summary>
        /// Contains this theme's author.
        /// </summary>
        public string Author { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for desktop display.
        /// </summary>
        public bool? IsDesktop { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for mobile display.
        /// </summary>
        public bool? IsMobile { get; set; }

        /// <summary>
        /// If this theme inherits from another theme, contains the inherited theme.
        /// </summary>
        public Theme Parent { get; set; }



        /// <summary>
        /// Interpret Under Scores
        /// </summary>
        public bool? EnableCoreVaraints  { get; set; }

        /// <summary>
        /// Contains the thumbnail for this theme or null.
        /// </summary>
        public Thumbnail Thumbnail { get; set; }

        ///// <summary>
        ///// Returns a complete theme inheritance stack with this theme as the first.
        ///// For legacy reasons, this property actually returns the theme names.
        ///// </summary>
        //public ICollection<Theme > Stack { 
        //    get {
        //        return StackT;
        //    }
        //}

        private LinkedList<Theme> _themStack;
        /// <summary>
        /// Returns a complete theme inheritance stack with this theme as the first.
        /// </summary>
        public ICollection<Theme> Stack
        {
            get
            {
                if (_themStack == null)
                {
                    LinkedList<Theme> stack = new LinkedList<Theme>(new[] { this });

                    Theme parent = this.Parent;
                    while (parent != null)
                    {
                        stack.AddLast(parent);

                        // we call this next line a parent trap
                        parent = parent.Parent;
                    }
                    _themStack = stack;
                }

                return _themStack;
            }
        }

        /// <summary>
        /// Contains the theme configuration object.
        /// </summary>
        public IEnumerable<ThemeConfigurationItem> Configuration { get; set; }


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
        public IEnumerable<ThemeConfigurationItem> NodeConfiguration { get; set; }

        /// <summary>
        /// Internal constructor.
        /// This class is intended to be initalized only by ThemeFactory.
        /// </summary>
        internal Theme() {}

        public string ThemePath { get; set; }
    }

    public class ThemeFileSystemInfo
    {
        public string Name { get; set; }
        public bool IsFile { get; set; }
        public string FullPath { get; set; }
        public string RootPath { get; set; }
        public string VirtualPath { get; set; }
        public System.IO.Stream  OpenRead()
        {
            return System.IO.File.OpenRead(FullPath);
        }

        public System.IO.TextReader  OpenText()
        {
             return System.IO.File.OpenText(FullPath);
        }
    }
}
