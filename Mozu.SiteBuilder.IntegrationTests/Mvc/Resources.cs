using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;
using Should;
using System.IO;

namespace Mozu.SiteBuilder.IntegrationTests.Mvc
{
    [TestFixture]
    public class Resources
    {
        [Test]
        public async Task Live_Templates_Handle_Parent_Theme()
        {
            var fileToContentMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                {"C:\\temp\\grandparent\\pages\\category.hypr.live", @"{% extends ""pages\category"" %}"},
                {"C:\\temp\\parent\\pages\\category.hypr.live", @"{% extends ""pages\category""|parent_template %}"},
                {"C:\\temp\\child\\pages\\category.hypr.live", @"{% extends ""pages\category""|parent_template %}"},
                {"C:\\temp\\child\\pages\\extends.hypr.live", @"{% extends ""pages\extends"" %}"},
                {"C:\\temp\\child\\pages\\noextends.hypr.live", @"wut"},
            };

            // setup file structure
            var dirs = new List<string>{"c:/temp", "c:/temp/parent", "c:/temp/parent/pages", "c:/temp/child", "c:/temp/child/pages", "c:/temp/grandparent", "c:/temp/grandparent/pages"};
            foreach (var dir in dirs.Where(x => !Directory.Exists(x)))
            {
                Directory.CreateDirectory(dir);
            }

            foreach (var pair in fileToContentMap)
            {
                File.WriteAllText(pair.Key, pair.Value);
            }

            // setup theme
            var grandparentTheme = new Theme
            {
                ThemePath = @"c:\temp\grandparent",
                Id = "grandparent",
                FileListing = new ThemeFileSystemInfoCollection(new List<ThemeFileSystemInfo>
                {
                    new ThemeFileSystemInfo
                    {
                        ThemeId = "grandparent",
                        VirtualPathNoExt = "templates\\pages\\category",
                        VirtualPath = "templates\\pages\\category.hypr.live",
                        FullPath = @"c:\temp\parent\pages\category.hypr.live",
                        IsFile = true
                    }
                })
            };

            var parentTheme = new Theme
            {
                ThemePath = @"c:\temp\parent",
                Id = "parent",
                Parent = grandparentTheme,
                FileListing = new ThemeFileSystemInfoCollection(new List<ThemeFileSystemInfo>
                {
                    new ThemeFileSystemInfo
                    {
                        ThemeId = "parent",
                        VirtualPathNoExt = "templates\\pages\\category",
                        VirtualPath = "templates\\pages\\category.hypr.live",
                        FullPath = @"c:\temp\parent\pages\category.hypr.live",
                        IsFile = true,
                    }
                })
            };
            var childTheme = new Theme
            {
                Parent = parentTheme,
                Id = "child",
                ThemePath = @"c:\temp\child",
                FileListing = new ThemeFileSystemInfoCollection(new List<ThemeFileSystemInfo>
                {
                    new ThemeFileSystemInfo // refers to parent
                    {
                        ThemeId = "child",
                        VirtualPathNoExt = "templates\\pages\\category",
                        VirtualPath = "templates\\pages\\category.hypr.live",
                        FullPath = @"C:\temp\child\pages\category.hypr.live",
                        IsFile = true,
                    },
                    new ThemeFileSystemInfo // has extends tag, but no parent_template
                    {
                        ThemeId = "child",
                        VirtualPathNoExt = "templates\\pages\\extends",
                        VirtualPath = "templates\\pages\\extends.hypr.live",
                        FullPath = @"C:\temp\child\pages\extends.hypr.live",
                        IsFile = true,
                    },
                    new ThemeFileSystemInfo // has no extends tag
                    {
                        ThemeId = "child",
                        VirtualPathNoExt = "templates\\pages\\noextends",
                        VirtualPath = "templates\\pages\\noextends.hypr.live",
                        FullPath = @"C:\temp\child\pages\noextends.hypr.live",
                        IsFile = true,
                    },
                })
            };

            var virtToFSIMap = new Dictionary<string, ThemeFileSystemInfo>();
            virtToFSIMap.AddRange(childTheme.FileListing.LiveTemplates.Select(x => new KeyValuePair<string, ThemeFileSystemInfo>(string.Format("templates/{0}",x.VirtualPathNoExt), x)));
            var context = Substitute.For<ISiteBuilderApiContext>();
            var settings = Substitute.For<ISettings>();
            settings.AppSettings("SSLValidationEnabled").Returns("true");
            settings.AppSettings("disableCDN").Returns("true");
            settings.CoreSettings.Returns(new CoreMozuApplicationSettings(settings));
            var scmh = new ServiceClientMessageHandler(context, settings);
            var httprequest = new HttpRequestMessage(HttpMethod.Get, "http://sb.volusion.com/admin/resources/livetemplates");
            var cookieprovider = Substitute.For<ICookieProvider>();

            var scontext = new SiteContext(new GeneralSettingsWebApiClient(scmh), null, null, null, cookieprovider, new CheckoutSettingsWebApiClient(scmh), context, settings, new LocationSettingsWebApiClient(scmh), new SitesWebApiClient(scmh), httprequest)
            {
                Theme = childTheme
            };

            var vpp = new MozuVirtualPathProvider(scontext);
            var nav = Substitute.For<INavigationGandalf>();
            var contentRetriever = new TestFileContentRetriver(fileToContentMap);

            var resourceController = new ResourceController(vpp, nav, contentRetriever);
            var results = await resourceController.LiveTemplates();
            results.Count.ShouldEqual(5);
            
        }

        public class TestFileContentRetriver : IThemeContentRetriever
        {
            private readonly Dictionary<string, string> _fileToContentMap;

            public TestFileContentRetriver(Dictionary<string, string> fileToContentMap)
            {
                _fileToContentMap = fileToContentMap;
            }

            public string GetContent(ThemeFileSystemInfo info)
            {
                return _fileToContentMap[info.FullPath];
            }

            public async Task<string> GetContentAsync(ThemeFileSystemInfo info)
            {
                return _fileToContentMap[info.FullPath];
            }

            public Stream GetStream(ThemeFileSystemInfo info)
            {
                var text = _fileToContentMap[info.FullPath];
                var bytes = Encoding.UTF8.GetBytes(text);
                return new MemoryStream(bytes);
            }
        }
    }
}
