using System;
using System.Linq;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Themes;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class DjangoUtilHelper : FSharpFunc<string,string>
    {
        private string[] _paths;

        public override string Invoke(string fullPath)
        {
            var paths = _paths;
            if (paths == null)
            {
                var tr = new ThemeMetadataProvider(Core.Settings.MozuConfigurationManager.Settings);
                paths = _paths = tr.ThemePaths.Union(tr.AddonPaths).ToArray();

            }
            if (string.IsNullOrEmpty(fullPath)) return "n/a";

            var root = paths.FirstOrDefault(x => fullPath.StartsWith(x, StringComparison.OrdinalIgnoreCase));
            return fullPath.Substring(root.Length);
        }
    }
}
