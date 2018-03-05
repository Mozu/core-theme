using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprViewEngine
    {
        private static readonly string[] g_formats = { "templates\\modules\\{0}", "templates\\{0}" };
        private static readonly string[] g_page_formats = { "templates\\pages\\{0}", "templates\\{0}" };
        private static readonly string[] g_widget_formats = { "widgets\\{0}" };
        private readonly IMozuVirtualPathProvider _mozuVirtualPathProvider;
        

        public HyprViewEngine(IMozuVirtualPathProvider mozuVirtualPathProvider)
        {
            _mozuVirtualPathProvider = mozuVirtualPathProvider;
        }

        public HyprView FindPageView(string path)
        {
            return FindView(path, g_page_formats);
        }

        public HyprView FindView (string path, IEnumerable<string> formats )
        {
            //return
            //    formats
            //        .Select(x => _mozuVirtualPathProvider.GetThemeFileInfo(string.Format(x, path), false))
            //        .Where(x => x != null)
            //        .Select(fileInfo => new HyprView(
            //            fileInfo.MongoId !=null?
            //           ViewEngineFile.ToString(fileInfo):
            //            fileInfo.FullPath
            //            , fileInfo.VirtualPath))
            //        .FirstOrDefault();


            return 
                formats
                .Select(x => _mozuVirtualPathProvider.GetThemeFileInfo(string.Format(x, path), false))
                    .Where(x => x != null)
                    .Select(fileInfo => new HyprView(ThemeFileSystemInfoHelper.ToString(fileInfo), fileInfo.VirtualPath))
                    .FirstOrDefault();
        }

        public HyprView FindModuleView(string path)
        {
            return FindView(path, g_formats);
        }
    }

    
    public class ThemeFileSystemInfoHelper
    {
      

        const string MongoPrefix = "mong:";
        const string FilePrefix =  "file:";

        public static string ToString(Themes.ThemeFileSystemInfo info )
        {
            if (!string.IsNullOrWhiteSpace(info.MongoId))
            {
                return $"{MongoPrefix}{info.MongoId}|{info.VirtualPath }|{info.ThemeId}";
            }
            return $"{FilePrefix}{info.RootPath}|{info.VirtualPath }|{info.ThemeId}";
        }
        
        public static Themes.ThemeFileSystemInfo ToInfo(string id)
        {
            
            var parts = id.Substring(MongoPrefix.Length).Split('|');
            var ret= new Themes.ThemeFileSystemInfo()
            {
                VirtualPath = parts[1],
                ThemeId = parts[2]
            };
            if (id.StartsWith(MongoPrefix))
            {
                ret.MongoId = parts[0];
            }
            else
            {
                ret.RootPath = parts[0];
            }
            return ret;
           
        }
       
    }
}