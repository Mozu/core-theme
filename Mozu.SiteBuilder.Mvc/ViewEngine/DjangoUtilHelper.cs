using System;
using System.Linq;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Themes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class DjangoUtilHelper : FSharpFunc<string,string>
    {
        private string[] _paths;
        private readonly IWebHostEnvironment _env;

        public DjangoUtilHelper(IWebHostEnvironment env)
        {
            _env = env;
        }

        public override string Invoke(string fullPath)
        {
            var paths = _paths;
            if (paths == null)
            {
                var tr = new ThemeMetadataProvider(Core.Settings.MozuConfigurationManager.Settings, null, null, _env);
                paths = _paths = tr.ThemePaths.Union(new List<string> { tr.CoreThemePath, tr.LegacyThemePath }).ToArray();
            }

            
            if (string.IsNullOrEmpty(fullPath)) return "n/a";

            var root = paths.FirstOrDefault(x => fullPath.StartsWith(x, StringComparison.OrdinalIgnoreCase));
            if (root != null)
            {
                return fullPath.Substring(root.Length);
            }
            else
            {
                try
                {
                    var themeInfo = ThemeFileSystemInfoHelper.ToInfo(fullPath);
                    if ( string.IsNullOrEmpty(themeInfo.VirtualPath ))
                    {
                        Mozu.Core.Logging.LoggingService.LoggerFor<DjangoUtilHelper>().Error($"bong:{fullPath}");
                        return "";
                    }
                    return themeInfo.VirtualPath;
                }
                catch(Exception)
                {
                    Mozu.Core.Logging.LoggingService.LoggerFor<DjangoUtilHelper>().Error($"bing:{fullPath}");

                    return "";
                   
                }
            
            }
        }
    }
}
