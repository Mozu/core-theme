using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Internal class implementing an IThemeInfo.
    /// </summary>
    [DataContract]
    public  class Theme
    {
        /// <summary>
        /// Id. Returns this theme's Id.
        /// </summary>
        [DataMember(Name="id")]
        public string Id { get; set; }

        /// <summary>
        /// Contains this theme's name.
        /// </summary>
        [DataMember(Name="name")]
        public string Name { get; set; }


        /// <summary>
        /// Contains this theme's author.
        /// </summary>
        [DataMember(Name = "author")]
        public string Author { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for desktop display.
        /// </summary>
        [DataMember(Name = "isDesktop")]
        public bool? IsDesktop { get; set; }

        /// <summary>
        /// Indicated whether this theme is intended to be used for mobile display.
        /// </summary>
        [DataMember(Name = "isMobile")]
        public bool? IsMobile { get; set; }

        /// <summary>
        /// If this theme inherits from another theme, contains the inherited theme.
        /// </summary>
        [DataMember(Name = "parent")]
        public Theme Parent { get; set; }

        /// <summary>
        /// Contains the thumbnail for this theme or null.
        /// </summary>
        [IgnoreDataMember]
        public Thumbnail Thumbnail { get; set; }

        
        private LinkedList<Theme> _themeStack;
        /// <summary>
        /// Returns a complete theme inheritance stack with this theme as the first.
        /// </summary>
        [Obsolete]
        [IgnoreDataMember]
        public ICollection<Theme> Stack
        {
            get
            {
                if (_themeStack == null)
                {
                    LinkedList<Theme> stack = new LinkedList<Theme>(new[] { this });

                    Theme parent = this.Parent;
                    while (parent != null)
                    {
                        stack.AddLast(parent);

                        // we call this next line a parent trap
                        parent = parent.Parent;
                    }
                    _themeStack = stack;
                }

                return _themeStack;
            }
        }

        public List<ThemeSetting> MergedSettings { get; set; }

        [DataMember(Name="pageTypes")]
        public List<Models.CMS.PageTypeDefinition> PageTypes { get; set; }

        [IgnoreDataMember]
        public List<Models.CMS.WidgetDefinition> Widgets { get; set; }
        
        [IgnoreDataMember]
        public ThemeFileSystemInfo[] FileListing { get; set; }

        /// <summary>
        /// Internal constructor.
        /// This class is intended to be initalized only by ThemeFactory.
        /// </summary>
        internal Theme() {}

        [IgnoreDataMember]
        public string ThemePath { get; set; }
    }

    public class ThemeFileSystemInfo
    {
        public string Name { get; set; }
        public bool IsFile { get; set; }
        public string FullPath { get; set; }
        public string RootPath { get; set; }
        public string VirtualPath { get; set; }
        public string VirtualPathNoExt { get; set; }

        public System.IO.Stream  OpenRead()
        {
            return System.IO.File.OpenRead(FullPath);
        }

        public System.IO.TextReader OpenText()
        {
            return System.IO.File.OpenText(FullPath);
        }
    }
}
