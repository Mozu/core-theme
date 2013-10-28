using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Xml.Serialization;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;

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

        ThemeMetaData GetAddon(string id);

        IEnumerable<string> ThemePaths { get; }
        IEnumerable<string> AddonPaths { get; }
        string LocalThemePath { get; }
        string LocalAddonPath { get; }
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


        /// <summary>
        /// Gets a theme by name or id.
        /// </summary>
        public ThemeMetaData GetTheme(string id)
        {
            if (String.IsNullOrWhiteSpace(id))
                return null;

            var tmd = new ThemeMetaData { Id = id };
            
            int intId;

            // if the id is an integer, try to get it from the network file share. otherwise, try to find it locally.
            if (int.TryParse(id, out intId))
                tmd.ThemePath = Path.GetFullPath(DevThemePath + id);
            else
                tmd.ThemePath = Path.GetFullPath(LocalThemePath +"//"+ id);

            if (!Directory.Exists(tmd.ThemePath))
                return null;

            tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_THEME_FILE_NAME);
            tmd.FileListing = LoadThemeFileListing(tmd.ThemePath);
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

            var tmd = new ThemeMetaData { Id = id };

            int intId;

            // if the id is an integer, try to get it from the network file share. otherwise, try to find it locally.
            if (int.TryParse(id, out intId))
                tmd.ThemePath = Path.GetFullPath(DevAddonPath + id);
            else
                tmd.ThemePath = Path.GetFullPath(LocalAddonPath + "//" + id);

            if (!Directory.Exists(tmd.ThemePath))
                return null;

            tmd.Configuration = LoadThemeDescriptor(tmd.ThemePath, METADATA_ADDON_FILE_NAME);
            tmd.FileListing = LoadThemeFileListing(tmd.ThemePath);
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
                    return new Thumbnail(Path.GetFileName(imageFilePath), File.ReadAllBytes(imageFilePath));
            }

            return null;
        }

        private ThemeConfiguration LoadThemeDescriptor(string themePath, string fileType )
        {
            // theme2 is the latest standard for theme files. it combines theme.xml and metada\themesettings.xml
            string fileName = Path.Combine(themePath, fileType);

            ThemeConfiguration themecfg = null;
            if (File.Exists(fileName))
            {
                using (var stream = File.OpenText(fileName))
                {
                    themecfg = _jsonSerializer.Deserialize<ThemeConfiguration>(new JsonTextReader(stream));
                }
            }

            return themecfg;
        }

        /// <summary>
        /// Gather info on all files contained within the theme and save them for later access.
        /// </summary>
        private ThemeFileSystemInfo[] LoadThemeFileListing(string themePath)
        {
            var dirinfo = new DirectoryInfo(themePath);
            if (!dirinfo.Exists)
                return null;

            return dirinfo.GetFileSystemInfos("*.*", SearchOption.AllDirectories).Select(x =>
            {
                var relPath = x.FullName.Substring(themePath.Length).Trim(new char[] { '\\' }).ToLowerInvariant();
                var relPathNoExt = relPath.GetFilePathNameWithoutExtension();
                return new ThemeFileSystemInfo()
                {
                    Name = x.Name,
                    FullPath = x.FullName,
                    RootPath = themePath,
                    VirtualPathNoExt = relPathNoExt,
                    VirtualPath = relPath,
                    IsFile = !x.Attributes.HasFlag(FileAttributes.Directory)
                };
            }).ToArray();
        }

        private string DevThemePath
        {
            get
            {
                var devPrefix = _settings.AppSettings("AppDevFileShare");
                return Path.GetFullPath(devPrefix +"\\themes\\" );
            }
        }

        public string DevAddonPath
        {
            get
            {
                var devPrefix = _settings.AppSettings("AppDevFileShare");
                return Path.GetFullPath(devPrefix + "\\widgets\\");
            }
        }

        public string LocalThemePath
        {
            get
            {
                var coreThemeDir = _settings.AppSettings("coretheme_directory");
                if (string.IsNullOrWhiteSpace(coreThemeDir))
                {
                    coreThemeDir = Path.GetFullPath(new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/themes/");
                }
                else
                {
                    if (!Path.IsPathRooted(coreThemeDir))
                    {
                        coreThemeDir = Path.GetFullPath(HostingEnvironment.MapPath(coreThemeDir));

                    }
                }
                return coreThemeDir;
            }
        }

        public string LocalAddonPath
        {
            get
            {
                var coreThemeDir = _settings.AppSettings("coretheme_directory");
                if (string.IsNullOrWhiteSpace(coreThemeDir))
                {
                    return  Path.GetFullPath(new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/addons/");
                }
                else
                {
                    return Path.GetFullPath(HostingEnvironment.MapPath(coreThemeDir) + "../addons/");
                    
                }
             
            }
        }

        public IEnumerable<string> ThemePaths
        {
            get
            {
                yield return DevThemePath;
                yield return LocalThemePath;
            }
        }

        public IEnumerable<string> AddonPaths
        {
            get
            {
                yield return DevAddonPath;
                yield return LocalAddonPath;
            }
        }
    }
}
