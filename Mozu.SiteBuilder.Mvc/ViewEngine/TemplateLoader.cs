using System;
using System.Collections;
using System.IO;
using System.Net.Http;
using Autofac;

using Mozu.SiteBuilder.Mvc.Extensions;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    internal class TemplateLoader : ITemplateLoader
    {
   

        public TextReader GetTemplate(string path)
        {
           // path = path.Split('|')[0];
            if (!Path.IsPathRooted(path))
            {
                throw new NotImplementedException("faaaak");
            }
          //  path = Path.GetFullPath(path).ToLowerInvariant();
            
            return new StreamReader(path);
        }
         
        public bool IsUpdated(string path, DateTime timestamp)
        {
            //path = path.Split('|')[0];
            //if (!Path.IsPathRooted(path))
            //{

            //    string vpath = path;
            //    if (path.IndexOf("templates", StringComparison.OrdinalIgnoreCase) == -1)
            //    {
            //        vpath = "templates\\" + path;
            //    }

            //    vpath = vpath.GetFilePathNameWithoutExtension();

            //    var vFile = PathProvider.GetThemeFileInfo(vpath, false);

            //    return System.IO.File.GetLastWriteTime(vFile.FullPath  ) > timestamp;
            //}
            
            return File.GetLastWriteTime(path) > timestamp;
        }
    }
}