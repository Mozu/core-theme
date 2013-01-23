using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Hosting;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;
using System.Xml.Serialization;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.Theme.Exceptions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Theme.Providers
{
    /// <summary>
    /// Uses the Volusion VirtualPathProvider to search ~/Themes for theme descriptions.
    /// </summary>
    internal class ThemeMetadataProvider : IThemeMetaDataProvider
    {
        private const string METADATA_SCHEMA_PATH = "~/tools/Theme.xsd";
        private const string SETTINGS_SCHEMA_PATH = "~/tools/ThemeSettings.xsd";
        private const string METADATA_FILE_NAME = "theme.xml";
        private readonly NameValueCollection _config;

        private VirtualPathProvider _pathProvider;
        private XmlSchemaSet _metadataValidationSchema;
        private XmlSchemaSet _settingsValidationSchema;

        /// <summary>
        /// Constructor.
        /// The project's <code>DjangoVolusionViewEngine</code> contains the <code>VirtualPathProvider</code> we need to get to.
        /// </summary>
        public ThemeMetadataProvider(System.Collections.Specialized.NameValueCollection config = null )
        {
            _config = config ?? System.Configuration.ConfigurationManager.AppSettings;
            // _pathProvider = System.Web.Mvc.ViewEngines.Engines.OfType<DjangoVolusionViewEngine>().First().PathProvider;

            // TODO: This is very cheesy, but we avoid Autofac hell trying to inject the DjanjoVolusionViewEngine
            // and <code>System.Web.Mvc.ViewEngines</code> is not necessarily set up at this point.
            // We need a beter way to get at the VirtualPathProvider and avoid the ViewEngine entirely.
          // 

            // set up XSD validation for theme.xml. We will call .Validate() as we load documents.
            _metadataValidationSchema = new XmlSchemaSet();
            _metadataValidationSchema.Add("", XmlReader.Create(GetResource("Theme.xsd")));

            // set up XSD validation for ThemeSettings.xml. We will call .Validate() as we load documents.
            
            _settingsValidationSchema = new XmlSchemaSet();
            _settingsValidationSchema.Add("", XmlReader.Create(GetResource("ThemeSettings.xsd")));

            _pathProvider = new MozuVirtualPathProvider(new DjangoMozuViewEngine());
        }

        private Stream GetResource( string resourceName)
        {
            var fn = this.GetType().Assembly.GetManifestResourceNames().First(x => x.EndsWith(resourceName , true, System.Globalization.CultureInfo.InvariantCulture));
            var stream = this.GetType().Assembly.GetManifestResourceStream(fn);
            return stream;
        }


        public IEnumerable<IThemeMetaData> GetThemes()
        {
            var tl = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var defThemeRoot = new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName + "/Mozu.SiteBuilder.UX.Themes/themes/";

            var parentDirs = (_config["theme.dirs"] ?? string.Empty).Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            parentDirs.Add(defThemeRoot);
            var parentDirInfos = parentDirs.Select(x => new DirectoryInfo(x)).Where(x => x.Exists).ToList();
            foreach (var parentDir in parentDirInfos)
            {
                foreach (var themeDir in parentDir.GetDirectories())
                {

                    var themeFile = themeDir.GetFiles(METADATA_FILE_NAME).FirstOrDefault();
                    var metadataDir = themeDir.GetDirectories("MetaData").FirstOrDefault();
                    var settingsFile = metadataDir == null ? null : metadataDir.GetFiles("ThemeSettings.xml").FirstOrDefault();
                    var thumbnailFile = metadataDir == null ? null : metadataDir.GetFiles("*thumb.*").FirstOrDefault();

                    if (themeFile == null || settingsFile == null)
                    {
                        // a theme is invalid if it does not contain a theme.xml and a ThemeSettings.xml file.
                        // TODO: log that we threw the theme out.
                        continue;
                    }

                    ThemeInformationMetadata themeInfo;
                    ConfigurationItemCollection themeSettings;

                    try
                    {
                        themeInfo = GetThemeInfoMetadataFromFile(themeFile.FullName );
                        themeSettings = GetThemeSettingsConfigurationFromFile(settingsFile.FullName);
                    }
                    catch (ThemeInfoMetadataDidntSerializeException)
                    {
                        // this is invalid because its theme.xml file didn't parse.
                        // TODO: log that we threw the theme out.
                        continue;
                    }
                    catch (ThemeSettingsConfigurationDidntSerializeException)
                    {
                        // this is invalid because its ThemeSettings.xml file didn't parse.
                        // TODO: log that we threw the theme out.
                        continue;
                    }

                    Thumbnail themeThumbnail = null;
                    if (thumbnailFile != null)
                    {
                        try
                        {
                            themeThumbnail = GetThemeThumbnailFromFile(thumbnailFile.FullName );
                        }
                        catch (IOException)
                        {
                            // thumbnail didn't load. it doesn't matter. the theme is still good.
                        }
                    }

                    yield return new ThemeMetaData(themeInfo, themeSettings, themeThumbnail);
                }
               
            }
           
        }



        /// <summary>
        /// Searches the filesystem at ~/Themes/ and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
        //public IEnumerable<IThemeMetaData> GetThemes2()
        //{
        //    VirtualDirectory themesRootDir = _pathProvider.GetDirectory("~/Themes/");

        //    // a "theme directory" is any subdirectory that contains a theme.xml file.
        //    var themeDirectories = themesRootDir.Directories.Cast<VirtualDirectory>().Where(d => d.Files.Cast<VirtualFile>().Any(f => f.Name == METADATA_FILE_NAME));

        //    foreach (VirtualDirectory themeDir in themeDirectories)
        //    {
        //        VirtualFile themeFile = ((IEnumerable<VirtualFile>)themeDir.Files).First(f => f.Name == METADATA_FILE_NAME);
        //        VirtualDirectory metadataDir = ((IEnumerable<VirtualDirectory>)themeDir.Directories).FirstOrDefault(d => "MetaData".Equals(d.Name, StringComparison.InvariantCultureIgnoreCase));
        //        VirtualFile settingsFile = metadataDir == null ? null : metadataDir.Files.Cast<VirtualFile>().FirstOrDefault(f => "ThemeSettings.xml".Equals(f.Name, StringComparison.InvariantCultureIgnoreCase));
        //        VirtualFile thumbnailFile = metadataDir == null ? null : metadataDir.Files.Cast<VirtualFile>().FirstOrDefault(f => Regex.IsMatch(f.Name, ".*thumb.*\\..*"));

        //        if (themeFile == null || settingsFile == null)
        //        {
        //            // a theme is invalid if it does not contain a theme.xml and a ThemeSettings.xml file.
        //            // TODO: log that we threw the theme out.
        //            continue;
        //        }

        //        ThemeInformationMetadata themeInfo;
        //        ConfigurationItemCollection themeSettings;

        //        try
        //        {
        //            themeInfo = GetThemeInfoMetadataFromFile(themeFile);
        //            themeSettings = GetThemeSettingsConfigurationFromFile(settingsFile);
        //        }
        //        catch (ThemeInfoMetadataDidntSerializeException)
        //        {
        //            // this is invalid because its theme.xml file didn't parse.
        //            // TODO: log that we threw the theme out.
        //            continue;
        //        }
        //        catch (ThemeSettingsConfigurationDidntSerializeException)
        //        {
        //            // this is invalid because its ThemeSettings.xml file didn't parse.
        //            // TODO: log that we threw the theme out.
        //            continue;
        //        }

        //        Thumbnail themeThumbnail = null;
        //        if (thumbnailFile != null)
        //        {
        //            try
        //            {
        //                themeThumbnail = GetThemeThumbnailFromFile(thumbnailFile);
        //            }
        //            catch (IOException)
        //            {
        //                // thumbnail didn't load. it doesn't matter. the theme is still good.
        //            }
        //        }

        //        yield return new ThemeMetaData(themeInfo, themeSettings, themeThumbnail);
        //    }
        //}

        /// <summary>
        /// Deserializes <code>ThemeInformationMetadata</code> from a <code>VirtualFile</code>.
        /// </summary>
        /// <exception cref="ThemeInfoMetadataDidntSerializeException">If the file fails XSD validation or does not serialize.</exception>        
        private ThemeInformationMetadata GetThemeInfoMetadataFromFile(string themeFileLoc)
        {
            XmlSerializer ser = new XmlSerializer(typeof(ThemeInformationMetadata));

            using (Stream stream = File.OpenRead(themeFileLoc))
            {
                XDocument doc = XDocument.Load(stream);

                try
                {
                    doc.Validate(_metadataValidationSchema, null);
                }
                catch (XmlSchemaValidationException e)
                {
                    throw new ThemeInfoMetadataDidntSerializeException(String.Format("The settings file at {0} did not validate.", themeFileLoc), e);
                }

                try
                {
                    ThemeInformationMetadata meta = (ThemeInformationMetadata)ser.Deserialize(doc.CreateReader());
                    return meta;
                }
                catch (Exception e)
                {
                    throw new ThemeInfoMetadataDidntSerializeException("An unknown exception occured deserializing the settings file at " + themeFileLoc, e);
                }
            }
        }


        /// <summary>
        /// Deserializes <code>ThemeSettings.ConfigurationItemCollection</code> from a <code>VirtualFile</code>.
        /// </summary>
        /// <exception cref="ThemeSettingsConfigurationDidntSerializeException">If the file fails XSD validation or does not serialize.</exception>
        private ConfigurationItemCollection GetThemeSettingsConfigurationFromFile(string settingsFile)
        {
            XmlSerializer ser = new XmlSerializer(typeof(ConfigurationItemCollection));

            using (Stream stream = File.OpenRead(settingsFile))
            {
                XDocument doc = XDocument.Load(stream);

                try
                {
                    doc.Validate(_settingsValidationSchema, null);
                }
                catch (XmlSchemaValidationException e)
                {
                    throw new ThemeSettingsConfigurationDidntSerializeException(String.Format("The settings file at {0} did not validate.", settingsFile), e);
                }

                try
                {
                    ConfigurationItemCollection config = (ConfigurationItemCollection)ser.Deserialize(doc.CreateReader());
                    return config;
                }
                catch (Exception e)
                {
                    throw new ThemeSettingsConfigurationDidntSerializeException("An unknown exception occured deserializing the settings file at " + settingsFile, e);
                }
            }
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
        private class ThemeMetaData : IThemeMetaData
        {
            public ThemeInformationMetadata ThemeInfo { get; private set; }
            public ConfigurationItemCollection ThemeSettings { get; private set;}
            public Thumbnail Thumbnail { get; private set; }

            public ThemeMetaData(ThemeInformationMetadata themeInfo, ConfigurationItemCollection themeSettings, Thumbnail thumbnail)
            {
                this.ThemeInfo = themeInfo;
                this.ThemeSettings = themeSettings;
                this.Thumbnail = thumbnail;
            }
        }
    }
}
