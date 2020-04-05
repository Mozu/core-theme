using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using MongoDB.Driver.GridFS;
using MongoDB.Driver;
using Mozu.Core.Mongo;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Defines an abstraction for discovering all theme descriptions from a data store.
    /// </summary>
    public  interface IThemeMetaDataProvider
    {
        /// <summary>
        /// Searches the underlying data store for themes and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
        //    IEnumerable<IThemeMetaData> GetThemes();

        Task<ThemeMetaData> GetTheme(string theme);

        Task<ThemeMetaData> GetThemeSlim(string theme);

        Task<ThemeMetaData> GetAddon(string id);

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

        Task<ThemeFileSystemInfoCollection> GetThemeFileListing(string themePath, string themeId);
        Task<bool> IsLatest(string themeId, DateTime timestamp);
    }


    /// <summary>
    /// Uses the Volusion VirtualPathProvider to search ~/Themes for theme descriptions.
    /// </summary>
    internal class ThemeMetadataProvider : IThemeMetaDataProvider
    {
        private readonly ISettings _settings;
        IMongoDatabaseProviderProvider _mongoDataseProviderProvider;
        private readonly JsonSerializer _jsonSerializer;
        private const string METADATA_THEME_FILE_NAME = "theme.json";
        private const string METADATA_ADDON_FILE_NAME = "addon.json";
        internal const char CanonicalDirectorySeperator = '/';
        internal const char WindowsDirectorySeperator = '\\';
        internal static char[] DircetorySeperators = new char[] { CanonicalDirectorySeperator, WindowsDirectorySeperator };
       

        IThemeContentRetriever _contentRetriever;
        /// <summary>
        /// Constructor.
        /// </summary>
        public ThemeMetadataProvider( ISettings settings, 
            IMongoDatabaseProviderProvider mongoDataseProviderProvider,
            IThemeContentRetriever contentRetriever)
        {
           
            _settings = settings;
            _mongoDataseProviderProvider = mongoDataseProviderProvider;
            _jsonSerializer = new JsonSerializer();
            _contentRetriever = contentRetriever;
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
        public async Task<ThemeMetaData> GetTheme(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return null;
            id = EscapeThemeId(id);
            var tmd = new ThemeMetaData { Id = id };
            SetThemePath(tmd);
            
            if (IsLocal(id))
            {
                return await GetThemeLegacy(id, tmd).ConfigureAwait(false);

            }
            tmd.FileListing = await LoadThemeFileListing(tmd.ThemePath, tmd.Id).ConfigureAwait(false);
            var themeJSon = tmd.FileListing.GetFileInfo(METADATA_THEME_FILE_NAME, true);

            tmd.Configuration = await LoadThemeDescriptor(themeJSon).ConfigureAwait(false);
            //  tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);
            tmd.Labels = await LoadThemeLabels(tmd).ConfigureAwait(false);
            tmd.TimeStamp = tmd.FileListing.TimeStamp;
            tmd.Hash = tmd.FileListing.Hash;

            if (tmd.Configuration == null)
                return null;

            return tmd;

        }
        private async Task< ThemeMetaData> GetThemeLegacy(string id, ThemeMetaData tmd)
        {


            if (!Directory.Exists(tmd.ThemePath))
                return null;

            tmd.FileListing = await LoadThemeFileListing(tmd.ThemePath, tmd.Id).ConfigureAwait(false);
            var json = tmd.FileListing.GetFileInfo(METADATA_THEME_FILE_NAME, true);
            tmd.Configuration = await LoadThemeDescriptor(json).ConfigureAwait(false);

            // tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);
            tmd.Labels = await LoadThemeLabels(tmd).ConfigureAwait(false);
            tmd.TimeStamp = tmd.FileListing.TimeStamp;
            tmd.Hash = tmd.FileListing.Hash;

            if (tmd.Configuration == null)
                return null;
            
            return tmd;

        }

        static bool IsLocal(string themeId)
        {
            return themeId.IndexOf("core", StringComparison.OrdinalIgnoreCase) > -1;
        }

        private void SetThemePath(ThemeMetaData tmd)
        {
            if (string.Equals(tmd.Id, Mozu.SiteBuilder.Mvc.Constants.DefaultTheme, StringComparison.OrdinalIgnoreCase))
            {
                tmd.ThemePath = this.CoreThemePath;
            }
            else if (tmd.Id.IndexOf("core", StringComparison.OrdinalIgnoreCase) == 0)
            {
                var temp = this.LegacyThemePath + "//themes//" + tmd.Id;
                if (Directory.Exists(temp))
                {
                    tmd.ThemePath = Path.GetFullPath(temp);
                }
            }
            if (tmd.ThemePath == null)
            {
                tmd.ThemePath = this.DevThemePath + "//" + UnEscapeThemeId(tmd.Id);
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
                    var temp = this.LegacyThemePath + "//themes//" + tmd.ThemeId;
                    tmd.RootPath = Path.GetFullPath(temp);
                }
                else 
                {
                    tmd.RootPath = this.DevThemePath + "//" + UnEscapeThemeId(tmd.ThemeId);
                }
            }
           
        }


        public async Task<ThemeMetaData> GetThemeSlim(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return null;
            id = EscapeThemeId(id);
            var tmd = new ThemeMetaData { Id = id };

            SetThemePath(tmd);

            if ( IsLocal(id))
            {
                if (!Directory.Exists(tmd.ThemePath))
                    return null;
                tmd.Configuration = LoadThemeDescriptorLegacy(tmd.ThemePath + "\\" + METADATA_THEME_FILE_NAME);
            }
            else
            {
                var gridFsInfo = await GetGirdFSFileInfo(id, METADATA_THEME_FILE_NAME).ConfigureAwait(false);
                if ( gridFsInfo == null)
                {
                    return null;
                }
                var tfi = this.CreateThemeFileSystemInfo(gridFsInfo, "\\\\foo\\bing", id);
                tmd.Configuration = await LoadThemeDescriptor(tfi).ConfigureAwait(false);
            }
           
            return tmd.Configuration == null ? null : tmd;
        }

        /// <summary>
        /// Gets a addon by name or id.
        /// </summary>
        public Task<ThemeMetaData> GetAddon(string id)
        {
            throw new NotImplementedException();
            //if (String.IsNullOrWhiteSpace(id))
            //    return null;
            //id = EscapeThemeId(id);
            //var tmd = new ThemeMetaData { Id = id };

            //int intId;


            //// if the id is an integer, try to get it from the network file share. otherwise, try to find it locally.
            //if (int.TryParse(id, out intId))
            //    tmd.ThemePath = Path.GetFullPath(DevAddonPath + id);
            //else
            //    tmd.ThemePath = Path.GetFullPath(LocalAddonPath + "//" + UnEscapeThemeId(id));

            //if (!Directory.Exists(tmd.ThemePath))
            //    return null;

            //tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_ADDON_FILE_NAME);
            //tmd.FileListing = LoadThemeFileListing(tmd.ThemePath, id );
            //tmd.Thumbnail = LoadThemeThumbnail(tmd.ThemePath);


            //if (tmd.Configuration == null)
            //    return null;

            //return tmd;

        }



       

        //private Thumbnail LoadThemeThumbnail(string themePath)
        //{
        //    if (Directory.Exists(themePath))
        //    {
        //        var imageFilePath = Directory.GetFiles(themePath, "*thumb.*").FirstOrDefault();
        //        if (imageFilePath != null)
        //            return new Thumbnail(Path.GetFileName(imageFilePath), imageFilePath);
        //    }

        //    return null;
        //}

        //static Lazy<JsonSerializer> _serializer = new Lazy<JsonSerializer>(() =>
        //{
        //    var ser = new JsonSerializer();

        //});

       

        private async Task<ThemeConfiguration> LoadThemeDescriptor(ThemeFileSystemInfo file)
        {
            if ( IsLocal(file.ThemeId))
            {
                return LoadThemeDescriptorLegacy(file.FullPath);
            }
            //pants
            var themecfg = new ThemeConfiguration();

            JObject themecfgJson = null;

            await using (var stream = await _contentRetriever.GetStreamAsync(file, CancellationToken.None).ConfigureAwait(false))
            {
                using var sr = new StreamReader(stream);
                var reader = new JsonTextReader(sr);
                themecfgJson = (JObject)JToken.ReadFrom(reader);
            }



            themecfg.About = themecfgJson["about"].ToObject<ThemeConfiguration.ThemeAbout>();
            themecfg.PageTypes = themecfgJson["pageTypes"] == null ? new List<PageTypeDefinition>() : themecfgJson["pageTypes"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.EmailTemplates = themecfgJson["emailTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["emailTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.BackOfficeTemplates = themecfgJson["backOfficeTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["backOfficeTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.Widgets = themecfgJson["widgets"] == null ? new List<WidgetDefinition>() : themecfgJson["widgets"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.WidgetDefinition>>();
            themecfg.Editors = themecfgJson["editors"] == null ? new List<EditorDefinition>() : themecfgJson["editors"].ToObject<List<EditorDefinition>>();
            themecfg.Layouts = themecfgJson["layoutWidgets"] == null ? new List<LayoutWidgetDefinition>() : themecfgJson["layoutWidgets"].ToObject<List<LayoutWidgetDefinition>>();
            themecfg.Settings = (themecfgJson["settings"]?.ToObject<Dictionary<string, object>>() ?? new Dictionary<string, object>()).ToDictionar2y(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);


            return themecfg;
        }
    
        private ThemeConfiguration LoadThemeDescriptorLegacy(string fileName)
        {
            // theme2 is the latest standard for theme files. it combines theme.xml and metada\themesettings.xml
      
            if (!File.Exists(fileName))
                return null;

            var themecfg = new ThemeConfiguration();
            var themecfgJsonText = File.ReadAllText(fileName);
            var themecfgJson = JObject.Parse(themecfgJsonText);

            

            themecfg.About = themecfgJson["about"].ToObject<ThemeConfiguration.ThemeAbout>();
            themecfg.PageTypes = themecfgJson["pageTypes"] == null ? new List<PageTypeDefinition> (): themecfgJson["pageTypes"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.EmailTemplates = themecfgJson["emailTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["emailTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.BackOfficeTemplates = themecfgJson["backOfficeTemplates"] == null ? new List<PageTypeDefinition>() : themecfgJson["backOfficeTemplates"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>>();
            themecfg.Widgets = themecfgJson["widgets"] == null ? new List<WidgetDefinition> (): themecfgJson["widgets"].ToObject<List<Mozu.SiteBuilder.Mvc.Models.CMS.WidgetDefinition>>();
            themecfg.Editors = themecfgJson["editors"] == null ? new List<EditorDefinition>() : themecfgJson["editors"].ToObject<List<EditorDefinition>>();
            themecfg.Layouts = themecfgJson["layoutWidgets"] == null ? new List<LayoutWidgetDefinition>() : themecfgJson["layoutWidgets"].ToObject<List<LayoutWidgetDefinition>>();
            themecfg.Settings = (themecfgJson["settings"]?.ToObject<Dictionary<string, object>>() ?? new Dictionary<string, object>()).ToDictionar2y(x => x.Key, x=>x.Value,StringComparer.OrdinalIgnoreCase);
               

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

        private async Task<Dictionary<string, ThemeLabelCollection>> LoadThemeLabels(ThemeMetaData themeMetaData)
        {
            var returnValues = new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase);

            var lableNfos = themeMetaData.FileListing.InternalFiles.Where(x => x.VirtualPath.StartsWith("labels", StringComparison.OrdinalIgnoreCase)).ToList();
           
            if (lableNfos.Count == 0 )
                return null;

            // inside of labels\ there are a bunch of json files named <locale>.json. For instance: "en-US.json"
            foreach (var labelJsonFile in lableNfos)
            {
                var localeCode = Path.GetFileNameWithoutExtension(labelJsonFile.VirtualPath);
                var labelCollection = new ThemeLabelCollection();
                var labelsJson = default(JObject);
                using (var stream = await _contentRetriever.GetStreamAsync(labelJsonFile, CancellationToken.None).ConfigureAwait(false))
                {
                    using var sr = new StreamReader(stream);
                    try
                    {
                        labelsJson = JObject.Load(new JsonTextReader(sr));
                    }
                    catch (Exception ex)
                    {
                        LoggingService.LoggerFor<ThemeMetadataProvider>().Error(ex);
                        continue;
                    }
                }
                foreach (var x in labelsJson.Children<JProperty>())
                {
                    labelCollection[x.Name] = (string) x.Value;
                }


                AddLocalizedDateNames(Path.GetFileName(labelJsonFile.VirtualPath), labelCollection);

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
                for (var i = 1; i < 13; i++)
                {
                    var month = (Months) i;
                    var shortMonth = (ShortMonths) i;
                    var key = (month).ToString();
                    var shortKey = (shortMonth).ToString();

                    if (!labelCollection.ContainsKey(key))
                    {
                        labelCollection[key] = ci.DateTimeFormat.GetMonthName((int) month);
                    }
                    if (!labelCollection.ContainsKey(shortKey))
                    {
                        labelCollection[shortKey] = ci.DateTimeFormat.GetAbbreviatedMonthName((int) shortMonth);
                    }
                }
                for (var i = 0; i < 7; i++)
                {
                    var day = (DayOfWeek) i;
                    var key = day.ToString().ToLowerInvariant();
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

        private ThemeFileSystemInfo CreateThemeFileSystemInfo( MongoDB.Driver.GridFS.GridFSFileInfo x , string themePath, string themeId)
        {
            var relPath = x.Filename.SanitizePath();
            var relPathNoExt = relPath.GetFilePathNameWithoutExtension();

            return new ThemeFileSystemInfo()
            {
                Name = relPath.Split(CanonicalDirectorySeperator).Last(),
                ThemeId = themeId,
                CheckSum = x.MD5,
                MongoId = x.Id.ToString(),
                //FullPath = themePath + "//"+ relPath,
                TimsStamp = x.UploadDateTime,
                RootPath = themePath,
                VirtualPathNoExt = relPathNoExt,
                VirtualPath = relPath,
                //IsCertified = themePath.IndexOf(CertifiedThemePath, StringComparison.OrdinalIgnoreCase) > -1,
                IsFile = true
            };
        }

        private ThemeFileSystemInfo CreateThemeFileSystemInfo(Mozu.AppDev.Contracts.AssetFileMetadata x, string themePath, string themeId)
        {
            var relPath = x.Path.SanitizePath();
            var relPathNoExt = relPath.GetFilePathNameWithoutExtension();
            return new ThemeFileSystemInfo()
            {
                Name = x.Path.Split(CanonicalDirectorySeperator).Last(),
                ThemeId = themeId,
                CheckSum = x.CheckSum,
               // FullPath = themePath + "//"+ x.Path,
                TimsStamp = x.AuditInfo?.UpdateDate ?? DateTime.MinValue,
                RootPath = themePath,
                VirtualPathNoExt = relPathNoExt,
                VirtualPath = relPath,
                //IsCertified = themePath.IndexOf( CertifiedThemePath, StringComparison.OrdinalIgnoreCase) > -1,
                IsFile = !x.IsFolder 
            };
        }
       
        private ThemeFileSystemInfo CreateThemeFileSystemInfo(FileSystemInfo x, string themePath, string themeId)
        {
            var relPath = x.FullName.Substring(themePath.Length).SanitizePath();
            var relPathNoExt = relPath.GetFilePathNameWithoutExtension();
            return new ThemeFileSystemInfo()
            {
                Name = x.Name,
                ThemeId = themeId,
                //FullPath = x.FullName,
                TimsStamp = x.LastWriteTimeUtc,
                RootPath = themePath,
                CheckSum = x.LastWriteTimeUtc.ToString("o"),
                VirtualPathNoExt = relPathNoExt,
                VirtualPath = relPath,
              //  IsCertified = themePath.IndexOf(CertifiedThemePath, StringComparison.OrdinalIgnoreCase) > -1,
                IsFile = !x.Attributes.HasFlag(FileAttributes.Directory)
            };
        }

        public  Task<ThemeFileSystemInfoCollection> GetThemeFileListing(string themePath, string themeId)
        {
            return LoadThemeFileListing( themePath,  themeId, false);
        }
      
        public async Task<bool> IsLatest(string themeId, DateTime timestamp)
        {
            var appId = ParseId(themeId);

            if (appId.Item1 == 0 || appId.Item2 == 0)
            {
                return true;
            }

            var filter = Builders<GridFSFileInfo>.Filter.And(
                Builders<GridFSFileInfo>.Filter.Gt("metadata.AuditInfo.UpdateDate", timestamp),
                Builders<GridFSFileInfo>.Filter.Eq("metadata.AppVersionId", appId.Item1),
                Builders<GridFSFileInfo>.Filter.Eq("metadata.PackageId", appId.Item2));
            var options = new GridFSFindOptions
            {
                Limit = 1,
            };
            var bucket = GetBucket();

            using var cursor = await bucket.FindAsync(filter, options).ConfigureAwait(false);
            return !await cursor.AnyAsync().ConfigureAwait(false);
        }

        async Task<GridFSFileInfo> GetGirdFSFileInfo(string themeId, string virtualPath)
        {
            var fn = virtualPath.SanitizePath();
            var appId =ParseId(themeId);
          
            if (appId.Item1 ==0 || appId.Item2 ==0 )
            {
                return null;
            }
     
            var filter = Builders<GridFSFileInfo>.Filter.And(
                Builders<GridFSFileInfo>.Filter.Regex(x => x.Filename, new MongoDB.Bson.BsonRegularExpression($"^{fn}$", "i")),
                Builders<GridFSFileInfo>.Filter.Eq("metadata.AppVersionId", appId.Item1),
                Builders<GridFSFileInfo>.Filter.Eq("metadata.PackageId", appId.Item2));
            var options = new GridFSFindOptions
            {
                Limit = 1,
            };
            var bucket = GetBucket();
            using var cursor = await bucket.FindAsync(filter, options).ConfigureAwait(false);
            var fileInfo = await cursor.FirstOrDefaultAsync().ConfigureAwait(false);
            return fileInfo;
        }

        public static  Tuple<int,int> ParseId( string themeId)
        {
            try
            {
                //  pants
                var parts = themeId.Trim('~').Split('~');
                if (parts.Length != 2)
                {
                    return new Tuple<int, int>(0, 0);
                }
                var app = int.Parse(parts[0]);
                var package = int.Parse(parts[1]);
                return new Tuple<int, int>(app, package);
            }
            catch
            {
                return new Tuple<int, int>(0, 0);
                
            }
        }

        private async Task <ThemeFileSystemInfoCollection> LoadThemeFileListing(string themePath, string themeId, bool allowFallback = true)
        {
            var appId = ParseId(themeId);
            if ( appId.Item1 ==0 || appId.Item2 == 0 )
            {
                return LegacyLoadThemeFileListing(themePath, themeId, allowFallback);
            }

            var filter = Builders<GridFSFileInfo>.Filter.And(
                Builders<GridFSFileInfo>.Filter.Eq("metadata.AppVersionId", appId.Item1),
                Builders<GridFSFileInfo>.Filter.Eq("metadata.PackageId", appId.Item2));

            var bucket = GetBucket();

            using var cursor = await bucket.FindAsync(filter).ConfigureAwait(false);
            var fileInfos = await cursor.ToListAsync().ConfigureAwait(false);
            var themeInfos = fileInfos.Select(x => CreateThemeFileSystemInfo(x, themePath, themeId));
            return new ThemeFileSystemInfoCollection(themeInfos, null, null);
        }
        GridFSBucket GetBucket()
        {
            var provider = _mongoDataseProviderProvider.Get("MongoAppDevItemDB", "AppDev", _settings);
            var database = provider.MongoDataBase;
            return  new GridFSBucket(database, new GridFSBucketOptions
            {
                BucketName = "Theme",
                ReadPreference = ReadPreference.SecondaryPreferred
            });
        }


        /// <summary>
        /// Gather info on all files contained within the theme and save them for later access.
        /// </summary>
        private ThemeFileSystemInfoCollection LegacyLoadThemeFileListing(string themePath, string themeId, bool allowFallback = true)
        {
           

            var dirinfo = new DirectoryInfo(themePath);
            if (!dirinfo.Exists) return null;
            Mozu.AppDev.Contracts.PackageManifest manifest = null;
            var pmf = Path.Combine(dirinfo.FullName, "packageManifest.json");
            if ( File.Exists(pmf))
            {
                using var str = File.OpenRead(pmf);
                using var sr = new StreamReader(str);
                var jtr = new JsonTextReader(sr);
                manifest = _jsonSerializer.Deserialize<Mozu.AppDev.Contracts.PackageManifest>(jtr);
            }
            if ( manifest != null )
            {
                var tf = manifest.Files.Where( _=> !(_.IsFolder == false && _.SizeInBytes == 0 ))
                    .Select(x => CreateThemeFileSystemInfo(x, themePath, themeId))
                    .ToList();
                return new ThemeFileSystemInfoCollection(tf,  manifest.LastModifiedDate, manifest.MD5);
            }
            if (!allowFallback )
            {
                return null;
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

        

        public string LocalAddonPath => null;

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
       public string LegacyThemePath => GetFullPath("CoreLegacyTheme");

       public  string CoreThemePath => GetFullPath("CoreTheme");

       string GetFullPath(string settingKey)
       {
            var setting = _settings.AppSettings(settingKey + "_directory");
            if (setting.IsNullOrEmpty())
            {
                return Path.Join( new DirectoryInfo(System.Environment.CurrentDirectory).Parent.Parent.FullName , "/Mozu." + settingKey);
            }
           
            return Path.GetFullPath(setting);
        }

    }
    public static class StringExt
    {
        public static string SanitizePath(this string path)
        {
            return path?.Trim(ThemeMetadataProvider.DircetorySeperators).Replace(ThemeMetadataProvider.WindowsDirectorySeperator, ThemeMetadataProvider.CanonicalDirectorySeperator);
        }
    }
}
