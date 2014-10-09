using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
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
        public void Live_Templates_Handle_Parent_Theme()
        {
            var vpp = Substitute.For<IMozuVirtualPathProvider>();
            var nav = Substitute.For<INavigationGandalf>();

            var fileToContentMap = new Dictionary<string, string>
            {
                {@"C:\temp\parent\pages\category.hypr.live", @"I am a template, for reals"},
                {@"C:\temp\child\pages\category.hypr.live", @"{% extends ""pages\category""|parent_template %}"},
                {@"C:\temp\child\pages\extends.hypr.live", @"{% extends ""pages\extends"" %}"},
                {@"C:\temp\child\pages\noextends.hypr.live", @"wut"},
            };

            // setup file structure
            var dirs = new List<string>{"c:/temp", "c:/temp/parent", "c:/temp/parent/pages", "c:/temp/child", "c:/temp/child/pages"};
            foreach (var dir in dirs.Where(x => !Directory.Exists(x)))
            {
                Directory.CreateDirectory(dir);
            }

            foreach (var pair in fileToContentMap)
            {
                File.WriteAllText(pair.Key, pair.Value);
            }

            // setup theme

            var parentTheme = new Theme
            {
                ThemePath = @"c:\temp\parent",
                Id = "parent",
                FileListing = new ThemeFileSystemInfoCollection(new List<ThemeFileSystemInfo>
                {
                    new ThemeFileSystemInfo
                    {
                        ThemeId = "parent",
                        VirtualPathNoExt = "pages/category",
                        VirtualPath = "pages/category.hypr.live",
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
                        VirtualPathNoExt = "pages/category",
                        VirtualPath = "pages/category.hypr.live",
                        FullPath = @"C:\temp\child\pages\category.hypr.live",
                        IsFile = true,
                    },
                    new ThemeFileSystemInfo // has extends tag, but no parent_template
                    {
                        ThemeId = "child",
                        VirtualPathNoExt = "pages/extends",
                        VirtualPath = "pages/extends.hypr.live",
                        FullPath = @"C:\temp\child\pages\extends.hypr.live",
                        IsFile = true,
                    },
                    new ThemeFileSystemInfo // has no extends tag
                    {
                        ThemeId = "child",
                        VirtualPathNoExt = "pages/noextends",
                        VirtualPath = "pages/noextends.hypr.live",
                        FullPath = @"C:\temp\child\pages\noextends.hypr.live",
                        IsFile = true,
                    },
                })
            };

            var virtToFSIMap = new Dictionary<string, ThemeFileSystemInfo>();
            virtToFSIMap.AddRange(childTheme.FileListing.LiveTemplates.Select(x => new KeyValuePair<string, ThemeFileSystemInfo>(string.Format("templates/{0}",x.VirtualPathNoExt), x)));
            var templates = childTheme.FileListing.LiveTemplates;
            vpp.GetLiveTemplates().Returns(templates);
            vpp.GetThemeFileInfo(Arg.Any<string>(), Arg.Any<bool>()).Returns(ctx => virtToFSIMap[ctx.Arg<string>()]);
            vpp.GetParentThemeFileInfo(Arg.Any<ThemeFileSystemInfo>()).Returns(ctx =>
            {
                var arg = ctx.Arg<ThemeFileSystemInfo>();
                if (arg.ThemeId.EqualsIgnoreCase(childTheme.Id) &&
                    arg.VirtualPathNoExt.EqualsIgnoreCase("pages/category"))
                    return parentTheme.FileListing.LiveTemplates.First();
                return null;
            });

            var resourceController = new ResourceController(vpp, nav);
            var results = resourceController.LiveTemplates();
            results.Count.ShouldEqual(4);
        }
    }
}
