using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Hosting;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;
using System.Xml.Serialization;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Themes.Providers
{
    /// <summary>
    /// Uses the Volusion VirtualPathProvider to search ~/Themes for theme descriptions.
    /// </summary>
    internal class ThemeMetadataProvider : IThemeMetaDataProvider
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IApiContext _apiContext;
        //  private const string METADATA_SCHEMA_PATH = "~/tools/Theme.xsd";
       // private const string SETTINGS_SCHEMA_PATH = "~/tools/ThemeSettings.xsd";
        //private const string METADATA_FILE_NAME = "theme.xml";
        private readonly NameValueCollection _config;

        private static  XmlSerializer   _themeInformationMetadataSerialzer=  new System.Xml.Serialization.XmlSerializer(typeof (ThemeInformationMetadata));
        private static XmlSerializer    _configurationItemCollectionSerializer = new XmlSerializer(typeof(ThemeConfigurationItemCollection));

        
        
        /// <summary>
        /// Constructor.
        /// The project's <code>DjangoVolusionViewEngine</code> contains the <code>VirtualPathProvider</code> we need to get to.
        /// </summary>
        public ThemeMetadataProvider( Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient , IApiContext apiContext, System.Collections.Specialized.NameValueCollection config = null )
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _apiContext = apiContext;
            _config = config ?? System.Configuration.ConfigurationManager.AppSettings;
        }

        
        /// <summary>
        /// Private implementation of <code>IThemeMetaData</code>
        /// </summary>
        
        public ThemeMetaData GetTheme(string id, bool forDev)
        {
            var tmd = new ThemeMetaData();
            tmd.Id = id;
            int intId;
            var devPrefix = _config["devThemeBasePath"];
            string themePath = null;
            if (int.TryParse(id, out intId))
            {
                themePath = Path.GetFullPath(devPrefix + "//devshare//" + id);
                /*work around for busted service
                var res=_tenantsWebApiClient.GetSiteEntitlement(_apiContext.SiteId.GetValueOrDefault(), _apiContext.TenantId,intId ).Result;
                if (res.ResponseMessage.StatusCode == HttpStatusCode.OK)
                {
                    var ent = res.ReadAsSync();
                    themePath = Path.Combine(devPrefix, ent.ApplicationAssetPath);

                }
                else
                {
                    return null;
                }*/


            }
            else
            {
                var localPath = new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/themes/";
                themePath = Path.GetFullPath(localPath +"//"+ id);
            }
            tmd.ThemePath = themePath;

            tmd.FileListing = new DirectoryInfo(themePath).GetFileSystemInfos("*.*", SearchOption.AllDirectories)
                                                          .Select(x => new ThemeFileSystemInfo()
                                                                           {
                                                                               Name = x.Name,
                                                                               FullPath = x.FullName ,
                                                                               RootPath = themePath ,
                                                                               VirtualPath = x.FullName.Substring( themePath.Length ).TrimEnd(new char[]{'\\'})
                                                                           }).ToArray() ;

            var widgetMetaDataDir = Path.GetFullPath(themePath + "//metadata//widgets");
            var pageTypesMetaDataDir = Path.GetFullPath(themePath + "//metadata//PageTypes");
            var jSerializer = new JsonSerializer();

            tmd.Widgets= tmd.FileListing.Where(x => x.VirtualPath.StartsWith(widgetMetaDataDir, StringComparison.OrdinalIgnoreCase) && x.Name.Equals ("\\definition.json", StringComparison.OrdinalIgnoreCase))
               .Select(x =>
                   {
                       using (var stream = File.OpenText(x.FullPath ))
                       {
                           return jSerializer.Deserialize<WidgetDefinition>(new JsonTextReader(stream));
                       }
                   }).ToList();

            tmd.PageTypes = tmd.FileListing.Where(x => x.VirtualPath.StartsWith( pageTypesMetaDataDir, StringComparison.OrdinalIgnoreCase) && x.Name.Equals("\\definition.json", StringComparison.OrdinalIgnoreCase))
               .Select(x =>
               {
                   using (var stream = File.OpenText(x.FullPath))
                   {
                       return jSerializer.Deserialize<WidgetDefinition>(new JsonTextReader(stream));
                   }
               }).ToList();




            
            var themeInfoMetaDataFilePath = themePath + "\\metadata\\theme.xml";
            if (!File.Exists(themeInfoMetaDataFilePath))
            {
                themeInfoMetaDataFilePath = themePath + "\\theme.xml";
            }
            using (var fs = File.OpenRead(themeInfoMetaDataFilePath))
            {
                tmd.ThemeInfo = (ThemeInformationMetadata ) _themeInformationMetadataSerialzer.Deserialize(fs);
                tmd.ThemeInfo.Id  = id;
            }
            var themeSettingsFilePath = themePath + "\\metadata\\ThemeSettings.xml";
            using (var fs = File.OpenRead(themeSettingsFilePath))
            {
                tmd.ThemeSettings = (ThemeConfigurationItemCollection) _configurationItemCollectionSerializer.Deserialize(fs);
            }
            var imageFilePath = Directory.GetFiles(themePath + "\\metadata", "*thumb.*").FirstOrDefault();
            if (imageFilePath != null)
            {
                tmd.Thumbnail = new Thumbnail(Path.GetFileName(imageFilePath ), File.ReadAllBytes(imageFilePath ));
            }
            tmd.ThemePath = Path.GetFullPath(themePath);
            
            return tmd;

        }
    }
}
