using System;
using System.Collections.Generic;
using System.Collections;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using AutoMapper;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Defines an abstraction for discovering all theme descriptions from a data store.
    /// </summary>
    internal interface IThemeMetaDataProvider
    {
        /// <summary>
        /// Searches the underlying data store for themes and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
        //    IEnumerable<IThemeMetaData> GetThemes();

        ThemeMetaData GetTheme(string theme);

        ThemeMetaData GetThemeSlim(string theme);

        ThemeMetaData GetAddon(string id);

        IEnumerable<string> ThemePaths { get; }
        IEnumerable<string> AddonPaths { get; }


        string LegacyThemePath
        {
            get;
        }

        string CoreThemePath
        {
            get;
        }
        
        string LocalAddonPath { get; }

        void FixPaths(Theme fileListing);
    }


    /// <summary>
    /// Uses the Volusion VirtualPathProvider to search ~/Themes for theme descriptions.
    /// </summary>
    internal class ThemeMetadataProvider : IThemeMetaDataProvider
    {
        private readonly ISettings _settings;
        private readonly JsonSerializer _jsonSerializer;
        private const string METADATA_THEME_FILE_NAME = "theme.json";
        private const string METADATA_ADDON_FILE_NAME = "addon.json";
       
        /// <summary>
        /// Constructor.
        /// </summary>
        public ThemeMetadataProvider( ISettings settings )
        {
            _settings = settings;
            _jsonSerializer = new JsonSerializer();
        }


        string EscapeThemeId(string id)
        {
            return (id ?? "").Replace("/", "~").Replace("\\", "~");
        }
        string UnEscapeThemeId(string id)
        {
            return (id ?? "").Replace("~", "\\");
        }


        /// <summary>
        /// Gets a theme by name or id.
        /// </summary>
        public ThemeMetaData GetTheme(string id)
        {
            if (String.IsNullOrWhiteSpace(id))
                return null;
            id = EscapeThemeId(id);
            var tmd = new ThemeMetaData { Id = id };


            SetThemePath( tmd);

            if (!Directory.Exists(tmd.ThemePath))
                return null;




            tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_THEME_FILE_NAME);
            tmd.FileListing = LoadThemeFileListing(tmd.ThemePath, tmd.Id );
            tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);
            tmd.Labels = LoadThemeLabels(tmd.ThemePath);
            tmd.TimeStamp = tmd.FileListing.TimeStamp;
            tmd.Hash = tmd.FileListing.Hash;

            if (tmd.Configuration == null)
                return null;
            
            return tmd;

        }

        private void SetThemePath(ThemeMetaData tmd)
        {
            if (string.Equals(tmd.Id, Mozu.SiteBuilder.Mvc.Constants.DefaultTheme, StringComparison.OrdinalIgnoreCase))
            {
                tmd.ThemePath = this.CoreThemePath;
            }
            else if (tmd.Id.IndexOf("core", StringComparison.OrdinalIgnoreCase) == 0)
            {
                string temp = this.LegacyThemePath + "//themes//" + tmd.Id;
                if (Directory.Exists(temp))
                {
                    tmd.ThemePath = Path.GetFullPath(temp);
                }
            }
            if (tmd.ThemePath == null)
            {
                tmd.ThemePath =
                    ThemePaths.Select(p => Path.GetFullPath(p + "//" + UnEscapeThemeId(tmd.Id)))
                        .FirstOrDefault(p => Directory.Exists(p));
            }
        }


        public  void FixPaths(Theme theme)
        {
            if ( theme?.FileListing == null)
            {
                return;
            }
            foreach (var tmd in theme.FileListing.InternalFiles)
            {
                if (string.Equals(tmd.ThemeId, Mozu.SiteBuilder.Mvc.Constants.DefaultTheme, StringComparison.OrdinalIgnoreCase))
                {
                    tmd.RootPath = this.CoreThemePath;
                }
                else if (tmd.ThemeId.IndexOf("core", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    string temp = this.LegacyThemePath + "//themes//" + tmd.ThemeId;
                    tmd.RootPath = Path.GetFullPath(temp);
                }
                else if ( tmd.IsCertified )
                {
                    tmd.RootPath = this.CertifiedThemePath + "//" + UnEscapeThemeId( tmd.ThemeId);
                }else
                {
                    tmd.RootPath = this.DevThemePath + "//" + UnEscapeThemeId(tmd.ThemeId);
                }
            }
           
        }


        public ThemeMetaData GetThemeSlim(string id)
        {
            if (String.IsNullOrWhiteSpace(id))
                return null;
            id = EscapeThemeId(id);
            var tmd = new ThemeMetaData { Id = id };

            SetThemePath(tmd);

            if (!Directory.Exists(tmd.ThemePath))
                return null;

            tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_THEME_FILE_NAME);
            tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);
           
            if (tmd.Configuration == null)
                return null;

            return tmd;

        }

        /// <summary>
        /// Gets a addon by name or id.
        /// </summary>
        public ThemeMetaData GetAddon(string id)
        {
            if (String.IsNullOrWhiteSpace(id))
                return null;
            id = EscapeThemeId(id);
            var tmd = new ThemeMetaData { Id = id };

            int intId;


            // if the id is an integer, try to get it from the network file share. otherwise, try to find it locally.
            if (int.TryParse(id, out intId))
                tmd.ThemePath = Path.GetFullPath(DevAddonPath + id);
            else
                tmd.ThemePath = Path.GetFullPath(LocalAddonPath + "//" + UnEscapeThemeId(id));

            if (!Directory.Exists(tmd.ThemePath))
                return null;

            tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_ADDON_FILE_NAME);
            tmd.FileListing = LoadThemeFileListing(tmd.ThemePath, id );
            tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);


            if (tmd.Configuration == null)
                return null;

            return tmd;

        }



       

        private Thumbnail LoadThemeThumbnail(string themePath)
        {
            if (Directory.Exists(themePath))
            {
                var imageFilePath = Directory.GetFiles(themePath, "*thumb.*").FirstOrDefault();
                if (imageFilePath != null)
                    return new Thumbnail(Path.GetFileName(imageFilePath), imageFilePath);
            }

            return null;
        }

        //static Lazy<JsonSerializer> _serializer = new Lazy<JsonSerializer>(() =>
        //{
        //    var ser = new JsonSerializer();
           
        //});


        private ThemeConfiguration LoadThemeDescriptor(string themePath, string fileType )
        {
            // theme2 is the latest standard for theme files. it combines theme.xml and metada\themesettings.xml
            string fileName = Path.Combine(themePath, fileType);

            if (!File.Exists(fileName))
                return null;

            ThemeConfiguration themecfg = new ThemeConfiguration();
            var themecfgJsonText = File.ReadAllText(fileName);
            var themecfgJson = JObject.Parse(themecfgJsonText);

            

            themecfg.About = themecfgJson["about"].ToObject<ThemeConfiguration.ThemeAbout>();
            themecfg.PageTypes = themecfgJson["pageTypes"] == null ? new List<PageTypeDefinition> (): themecfgJson["pageTypes"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.EmailTemplates = themecfgJson["emailTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["emailTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.BackOfficeTemplates = themecfgJson["backOfficeTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["backOfficeTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.Widgets = themecfgJson["widgets"] == null ? new List<WidgetDefinition> (): themecfgJson["widgets"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.WidgetDefinition>>();
            themecfg.Editors = themecfgJson["editors"] == null ? new List<EditorDefinition>() : themecfgJson["editors"].ToObject<List<EditorDefinition>>();
            themecfg.Layouts = themecfgJson["layoutWidgets"] == null ? new List<LayoutWidgetDefinition>() : themecfgJson["layoutWidgets"].ToObject<List<LayoutWidgetDefinition>>();
            themecfg.Settings = (themecfgJson["settings"].ToObject<Dictionary<string, object>>() ?? new Dictionary<string, object>()).ToDictionar2y(x => x.Key, x=>x.Value,StringComparer.OrdinalIgnoreCase);
               

            return themecfg;
        }

        private enum Months : int
        {

            january = 1,
            february = 2,
            march = 3,
            april = 4,
            may = 5,
            june = 6,
            july = 7,
            august = 8,
            september = 9,
            october = 10,
            november = 11,
            december = 12
        }

        private enum ShortMonths : int
        {
            shortJanuary = 1,
            shortFebruary = 2,
            shortMarch = 3,
            shortApril = 4,
            shortMay = 5,
            shortJune = 6,
            shortJuly = 7,
            shortAugust = 8,
            shortSeptember = 9,
            shortOctober = 10,
            shortNovember = 11,
            shortDecember = 12
        }

        private Dictionary<string, ThemeLabelCollection> LoadThemeLabels(string themePath)
        {
            Dictionary<string, ThemeLabelCollection> returnValues = new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase);
            string labelsPath = Path.Combine(themePath, "labels");

            if (!Directory.Exists(labelsPath))
                return null;

            // inside of labels\ there are a bunch of json files named <locale>.json. For instance: "en-US.json"
            foreach (string labelJsonFile in Directory.GetFiles(labelsPath, "*.json"))
            {
                string localeCode = Path.GetFileNameWithoutExtension(labelJsonFile);
                var labelCollection = new ThemeLabelCollection();

                var labelJsonFileText = File.ReadAllText(labelJsonFile);
                var labelsJson = JObject.Parse(labelJsonFileText);

                foreach (var x in labelsJson.Children<JProperty>())
                {
                    labelCollection[x.Name] = (string) x.Value;
                }


                AddLocalizedDateNames(labelJsonFile, labelCollection);

                returnValues[localeCode] = labelCollection;
            }



            return returnValues;
        }

        private static void AddLocalizedDateNames(string labelJsonFile, ThemeLabelCollection labelCollection)
        {
            try
            {

                var ci = System.Globalization.CultureInfo.GetCultureInfo(Path.GetFileNameWithoutExtension(labelJsonFile));
                System.Diagnostics.Debug.WriteLine(ci.LCID.ToString());
                for (int i = 1; i < 13; i++)
                {
                    var month = (Months) i;
                    var shortMonth = (ShortMonths) i;
                    string key = (month).ToString();
                    string shortKey = (shortMonth).ToString();

                    if (!labelCollection.ContainsKey(key))
                    {
                        labelCollection[key] = ci.DateTimeFormat.GetMonthName((int) month);
                    }
                    if (!labelCollection.ContainsKey(shortKey))
                    {
                        labelCollection[shortKey] = ci.DateTimeFormat.GetAbbreviatedMonthName((int) shortMonth);
                    }
                }
                for (int i = 0; i < 7; i++)
                {
                    var day = (DayOfWeek) i;
                    string key = day.ToString().ToLowerInvariant();
                    var shortKey = "short" + day.ToString();
                    if (!labelCollection.ContainsKey(key))
                    {
                        labelCollection[key] = ci.DateTimeFormat.GetDayName(day);
                    }

                    if (!labelCollection.ContainsKey(shortKey))
                    {
                        labelCollection[shortKey] = ci.DateTimeFormat.GetAbbreviatedDayName(day);
                    }
                }
            }
            catch
            {
            }
        }

        private ThemeFileSystemInfo CreateThemeFileSystemInfo(Mozu.AppDev.Contracts.AssetFileMetadata x, string themePath, string themeId)
        {
            var relPath = x.Path.Replace('/', '\\');
            var relPathNoExt = relPath.GetFilePathNameWithoutExtension();
            return new ThemeFileSystemInfo()
            {
                Name = x.Path.Split('/').Last(),
                ThemeId = themeId,
               // FullPath = themePath + "//"+ x.Path,
                TimsStamp = x.AuditInfo?.UpdateDate ?? DateTime.MinValue,
                RootPath = themePath,
                VirtualPathNoExt = relPathNoExt,
                VirtualPath = relPath,
                IsCertified = themePath.IndexOf( CertifiedThemePath, StringComparison.OrdinalIgnoreCase) > -1,
                IsFile = !x.IsFolder 
            };
        }

        private ThemeFileSystemInfo CreateThemeFileSystemInfo(FileSystemInfo x, string themePath, string themeId)
        {
            var relPath = x.FullName.Substring(themePath.Length).Trim(new char[] { '\\' }).ToLowerInvariant();
            var relPathNoExt = relPath.GetFilePathNameWithoutExtension();
            return new ThemeFileSystemInfo()
            {
                Name = x.Name,
                ThemeId = themeId,
                //FullPath = x.FullName,
                TimsStamp = x.LastWriteTimeUtc,
                RootPath = themePath,
                VirtualPathNoExt = relPathNoExt,
                VirtualPath = relPath,
                IsCertified = themePath.IndexOf(CertifiedThemePath, StringComparison.OrdinalIgnoreCase) > -1,
                IsFile = !x.Attributes.HasFlag(FileAttributes.Directory)
            };
        }

        /// <summary>
        /// Gather info on all files contained within the theme and save them for later access.
        /// </summary>
        private ThemeFileSystemInfoCollection LoadThemeFileListing(string themePath, string themeId)
        {
            var dirinfo = new DirectoryInfo(themePath);
            if (!dirinfo.Exists) return null;
            Mozu.AppDev.Contracts.PackageManifest manifest = null;
            var pmf = Path.Combine(dirinfo.FullName, "packageManifest.json");
            if ( File.Exists(pmf))
            {
                using (var str = File.OpenRead(pmf))
                {
                    using (var sr = new StreamReader(str))
                    {
                        var jtr = new JsonTextReader(sr);
                        manifest = _jsonSerializer.Deserialize<Mozu.AppDev.Contracts.PackageManifest>(jtr);
                    }

                        
                }
                    
            }
            if ( manifest != null )
            {
                var tf = manifest.Files.Where( _=> !(_.IsFolder == false && _.SizeInBytes == 0 ))
                    .Select(x => CreateThemeFileSystemInfo(x, themePath, themeId))
                    .ToList();
                return new ThemeFileSystemInfoCollection(tf,  manifest.LastModifiedDate, manifest.MD5);
            }

            var themeFiles = dirinfo.GetFiles().Select(x => CreateThemeFileSystemInfo(x, themePath, themeId)).ToList();

            var deepThemeFiles = 
                dirinfo.GetDirectories()
                .Where(subdir => !subdir.Name.EndsWith("node_modules", StringComparison.OrdinalIgnoreCase) && !subdir.Name.StartsWith(".", StringComparison.OrdinalIgnoreCase)  )
                .SelectMany(d => d.GetFileSystemInfos("*.*", SearchOption.AllDirectories)
                .Select(x => CreateThemeFileSystemInfo(x, themePath, themeId))
            ).ToList();

            return new ThemeFileSystemInfoCollection(themeFiles.Concat(deepThemeFiles).ToList(), null , null);
        }

        private string DevThemePath
        {
            get
            {
                var devPrefix = _settings.AppSettings("DevPackageFileShare");
                return Path.GetFullPath(devPrefix +"\\themes\\" );
            }
        }

        public string DevAddonPath
        {
            get
            {
                var devPrefix = _settings.AppSettings("DevPackageFileShare");
                return Path.GetFullPath(devPrefix + "\\widgets\\");
            }
        }

        private string CertifiedThemePath
        {
            get
            {
                var devPrefix = _settings.AppSettings("CertifiedPackageFileShare");
                return Path.GetFullPath(devPrefix + "\\themes\\");
            }
        }

        public string CertifiedAddonPath
        {
            get
            {
                var devPrefix = _settings.AppSettings("CertifiedPackageFileShare");
                return Path.GetFullPath(devPrefix + "\\widgets\\");
            }
        }

        

        public string LocalAddonPath
        {
            get
            {
                return null;// Path.GetDirectoryName( LocalThemePath)+"../addons/";
                
              
             
            }
        }

        public IEnumerable<string> ThemePaths
        {
            get
            {
                yield return CertifiedThemePath;
                yield return DevThemePath;
             
                
            }
        }

        public IEnumerable<string> AddonPaths
        {
            get
            {
                yield return CertifiedAddonPath;
                yield return DevAddonPath;
                yield return LocalAddonPath;
            }
        }
       public string LegacyThemePath
        {
            get
            {

                return GetFullPath("CoreLegacyTheme");
            }
        }

       public  string CoreThemePath
        {
            get
            {
                return GetFullPath("CoreTheme");
            }
        }

        string GetFullPath(string settingKey)
        {
            var setting = _settings.AppSettings(settingKey + "_directory");
            if (setting.IsNullOrEmpty())
            {
                return Path.GetFullPath(new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.Parent.FullName + "/Mozu." + settingKey);
            }
            if (setting[0] == '~')
            {
                return Path.GetFullPath(HostingEnvironment.MapPath(setting.Substring(1)));
            }
            return Path.GetFullPath(setting);

        }

    }
}
