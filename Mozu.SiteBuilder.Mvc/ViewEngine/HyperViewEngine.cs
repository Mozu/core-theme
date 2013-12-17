using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprViewEngine
    {
        private static readonly string[] g_formats = new[] { "templates\\modules\\{0}", "templates\\{0}" };


        private static readonly string[] g_page_formats = new[] { "templates\\pages\\{0}", "templates\\{0}" };
        private static readonly string[] g_widget_formats = new[] { "widgets\\{0}" };


        private readonly ITemplateManager _templateManager;
        private readonly MozuVirtualPathProvider _mozuVirtualPathProvider;
        

        public HyprViewEngine(ITemplateManager templateManager, MozuVirtualPathProvider mozuVirtualPathProvider)
        {
            _templateManager = templateManager;
            _mozuVirtualPathProvider = mozuVirtualPathProvider;
            
        }

        public HyprView FindPageView(string path)
        {
            return FindView(path, g_page_formats);
        }

        public HyprView FindView (string path, string[] formats )
        {
            foreach (var format in formats)
            {
                var formattedPath = string.Format(format, path);
                var fileInfo = _mozuVirtualPathProvider.GetThemeFileInfo(formattedPath, false);
                if (fileInfo != null)
                {
                    return new HyprView(fileInfo.FullPath, fileInfo.VirtualPath, _templateManager);
                }


            }


            return null;
        }


        public HyprView FindModuleView(string path)
        {
            return FindView(path, g_formats);
        }
    }
}