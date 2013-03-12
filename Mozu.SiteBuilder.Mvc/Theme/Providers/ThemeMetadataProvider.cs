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
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.Theme.Exceptions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Theme.Providers
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
        private const string METADATA_FILE_NAME = "theme.xml";
        private readonly NameValueCollection _config;

        private XmlSerializer _themeInformationMetadataSerialzer;
        private XmlSerializer _configurationItemCollectionSerializer;
        
        /// <summary>
        /// Constructor.
        /// The project's <code>DjangoVolusionViewEngine</code> contains the <code>VirtualPathProvider</code> we need to get to.
        /// </summary>
        public ThemeMetadataProvider( Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient , IApiContext apiContext, System.Collections.Specialized.NameValueCollection config = null )
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _apiContext = apiContext;
            _config = config ?? System.Configuration.ConfigurationManager.AppSettings;


            _themeInformationMetadataSerialzer=  new System.Xml.Serialization.XmlSerializer(typeof (ThemeInformationMetadata));
            _configurationItemCollectionSerializer = new XmlSerializer(typeof(ConfigurationItemCollection));
            
        }

        

        

        /// <summary>
        /// Reads the file contents of the thumbnail file into a <code>Thumbnail</code> object.
        /// </summary>
        /// <exception cref="IOException">Thrown by underlying calls to ReadBytes.</exception>
        private Thumbnail GetThemeThumbnailFromFile(string thumbnailFileLoc)
        {
            byte[] bytes = null;

            using ( var stream = File.OpenRead(thumbnailFileLoc))
            using (var reader = new BinaryReader(stream))
            {
                bytes = reader.ReadBytes((int)reader.BaseStream.Length);
            }

            return new Thumbnail(Path.GetFileName(thumbnailFileLoc), bytes);
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

                var items = _tenantsWebApiClient.GetSiteEntitlements(_apiContext.SiteId.GetValueOrDefault(), _apiContext.TenantId).Result.ReadAsSync().Items;
                var ent = items.FirstOrDefault(x => x.Id == intId);
                if ( ent != null )
                {
                    themePath = devPrefix + "//devshare//" + ent.ApplicationVersionId;

                }
                else
                {
                    return null;
                }
            }
            else
            {
                var localPath = new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/themes/";
                themePath = Path.Combine(localPath, id);
            }
            
            
            
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
                tmd.ThemeSettings = (ConfigurationItemCollection) _configurationItemCollectionSerializer.Deserialize(fs);
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
