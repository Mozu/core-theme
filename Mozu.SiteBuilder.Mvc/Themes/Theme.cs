using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Models.CMS;

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
        /// Indicated whether this theme is intended to be used for a tablet display.
        /// </summary>
        [DataMember(Name = "isTablet")]
        public bool? IsTablet { get; set; }

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
        public Dictionary<string, ThemeLabelCollection> MergedLabels { get; set; }

        [DataMember(Name="pageTypes")]
        public List<Models.CMS.PageTypeDefinition> PageTypes { get; set; }


        [DataMember(Name = "emailTemplates")]
        public List<Models.CMS.PageTypeDefinition> EmailTemplates { get; set; }

        [DataMember(Name = "orderTemplates")]
        public IEnumerable<PageTypeDefinition> BackOfficeTemplates { get; set; }


        [IgnoreDataMember]
        public List<Models.CMS.WidgetDefinition> Widgets { get; set; }


        [IgnoreDataMember]
        public List<EditorDefinition> Editors { get; set; }


        
        [IgnoreDataMember]
        public ThemeFileSystemInfoCollection  FileListing { get; set; }

        /// <summary>
        /// Internal constructor.
        /// This class is intended to be initalized only by ThemeFactory.
        /// </summary>
        internal Theme() {}

        public Theme Clone()
        {
            return (Theme)this.MemberwiseClone();
        }
        [IgnoreDataMember]
        public string ThemePath { get; set; }

        internal ThemeMetaData Source { get; set; }

        public DateTime TimeStamp { get; set; }

        public string DefaultLanguage { get; set; }

        public bool? AllowProduction { get; set; }

    }

    public class ThemeFileSystemInfo
    {
        public string Name { get; set; }
        public bool IsFile { get; set; }
        public string FullPath { get; set; }
        public string RootPath { get; set; }
        public string VirtualPath { get; set; }
        public string VirtualPathNoExt { get; set; }
        public DateTime TimsStamp { get; set; }

        public string ThemeId { get; set; }
    }

    /// <summary>
    /// This interface serves as a way to abstract getting the content of a theme from the ThemeFileSystemInfo instance associated with that content.
    /// So far, it's just necessary to enable unit tests.
    /// </summary>
    public interface IThemeContentRetriever
    {
        string GetContent(ThemeFileSystemInfo info);
        Task<string> GetContentAsync(ThemeFileSystemInfo info);
        Stream GetStream(ThemeFileSystemInfo info);
    }

    public class FileSystemContentRetriever : IThemeContentRetriever
    {
        public string GetContent(ThemeFileSystemInfo info)
        {
            return File.ReadAllText(info.FullPath);
        }

        public async Task<string> GetContentAsync(ThemeFileSystemInfo info)
        {
            using (var r = new StreamReader(GetStream(info)))
            {
                return await r.ReadToEndAsync();
            }
        }

        public Stream GetStream(ThemeFileSystemInfo info)
        {
            return File.OpenRead(info.FullPath);
        }
    }
}
