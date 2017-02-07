using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Internal class implementing an IThemeInfo.
    /// </summary>
    [DataContract]
    //[JsonConverter(typeof(Theme.ThemeJsonConverter))]
    public  class Theme
    {


        [OnSerializing]
        private void SetValuesOnSerializing(StreamingContext context)
        {
            if ( (this.Stack?.Count).GetValueOrDefault(0) ==0 )
            {
                return;
            }
            foreach ( var t in Stack)
            {
                this.FileListing?.UnionWith(t.FileListing);
            }

        }
        [OnDeserialized]
        void OnDeserializedMethod(StreamingContext context)
        {
            this.MergedLabels = MergedLabels.ToDictionar2y(x => x.Key, y => y.Value, StringComparer.OrdinalIgnoreCase);
            this.Settings = this.Settings.ToDictionar2y(x => x.Key, y => y.Value, StringComparer.OrdinalIgnoreCase);

        }



    /// <summary>
    /// Id. Returns this theme's Id.
    /// </summary>
    [DataMember(Name="id")]
        public string Id { get; set; }

       




        [IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore()]
        public bool IsCoreTheme {
            get {
                return this.Id != null && Regex.IsMatch(this.Id, "^core[\\d]+$", RegexOptions.IgnoreCase);

            }
        }



        /// <summary>
        /// Contains this theme's name.
        /// </summary>
        [DataMember(Name="name")]
        public string Name { get; set; }

        /// <summary>
        /// Theme version number
        /// </summary>
        [DataMember(Name = "version")]
        public string Version { get; set; }


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
      //  [DataMember(Name = "parent")]
        [IgnoreDataMember]
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

        public Dictionary<string,object> Settings { get; set; }

        [DataMember]
        public Dictionary<string, ThemeLabelCollection> MergedLabels { get; set; }

        [DataMember(Name="pageTypes")]
        public List<Models.CMS.PageTypeDefinition> PageTypes { get; set; }


        [DataMember(Name = "emailTemplates")]
        public List<Models.CMS.PageTypeDefinition> EmailTemplates { get; set; }

        [DataMember(Name = "orderTemplates")]
        public IEnumerable<PageTypeDefinition> BackOfficeTemplates { get; set; }


        //[IgnoreDataMember]
        [DataMember]
        public List<Models.CMS.WidgetDefinition> Widgets { get; set; }


       // [IgnoreDataMember]
        [DataMember]
        public List<EditorDefinition> Editors { get; set; }

       // [IgnoreDataMember]
        [DataMember]
        public List<LayoutWidgetDefinition> Layouts { get; set; }

        [DataMember(Name="fileListing")]
       // [IgnoreDataMember]  <==TODO validate that this isnt ever serialized in hypr
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
        public string Hash { get;  set; }
        [IgnoreDataMember]
        [JsonIgnore]
        internal bool PathsAreFixed { get;  set; }

        public static implicit operator Dictionary<object, object>(Theme v)
        {
            throw new NotImplementedException();
        }

       
    }

    public class ThemeFileSystemInfo
    {
        public string Name { get; set; }
        public bool IsFile { get; set; }
        string _filePath;
        [JsonIgnore]
        public string FullPath
        {
            get
            {
                return _filePath ?? (_filePath = BuildPath());
            }
        }
        string BuildPath()
        {
            return RootPath + "//" + VirtualPath;
        }
        [JsonIgnore]
        public string RootPath { get; set; }
        public string VirtualPath { get; set; }
        public string VirtualPathNoExt { get; set; }
        public DateTime TimsStamp { get; set; }
        public bool IsCertified { get; set; }

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


        static System.Collections.Concurrent.ConcurrentBag<byte[]> _bytePool = new System.Collections.Concurrent.ConcurrentBag<byte[]>();
        static System.Collections.Concurrent.ConcurrentBag<char[]> _charPool = new System.Collections.Concurrent.ConcurrentBag<char[]>();

        public async Task<string> GetContentAsync(ThemeFileSystemInfo info)
        {
            
            using (var r = new StreamReader(GetStream(info)))
            {
                return await r.ReadToEndAsync().ConfigureAwait(false);
            }
        }

        public Stream GetStream(ThemeFileSystemInfo info)
        {
            return  new FileStream(info.FullPath,
               FileMode.Open, 
               FileAccess.Read, 
               FileShare.ReadWrite,
               bufferSize: 4096, 
               useAsync: true);
            
        }
       
    }
}
