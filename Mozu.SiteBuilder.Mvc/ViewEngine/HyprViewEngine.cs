using System.Collections.Generic;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprViewEngine
    {
        private static readonly string[] g_formats = { "templates\\modules\\{0}", "templates\\{0}" };
        private static readonly string[] g_page_formats = { "templates\\pages\\{0}", "templates\\{0}" };
        private static readonly string[] g_widget_formats = { "widgets\\{0}" };
        private readonly MozuVirtualPathProvider _mozuVirtualPathProvider;
        

        public HyprViewEngine(MozuVirtualPathProvider mozuVirtualPathProvider)
        {
            _mozuVirtualPathProvider = mozuVirtualPathProvider;
        }

        public HyprView FindPageView(string path)
        {
            return FindView(path, g_page_formats);
        }

        public HyprView FindView (string path, IEnumerable<string> formats )
        {
            return
                formats
                    .Select(x => _mozuVirtualPathProvider.GetThemeFileInfo(string.Format(x, path), false))
                    .Where(x => x != null)
                    .Select(fileInfo => new HyprView(fileInfo.FullPath, fileInfo.VirtualPath))
                    .FirstOrDefault();
        }

        public HyprView FindModuleView(string path)
        {
            return FindView(path, g_formats);
        }
    }
}