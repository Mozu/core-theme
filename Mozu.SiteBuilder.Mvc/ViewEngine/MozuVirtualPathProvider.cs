using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Web.Hosting;
using System.Web;
using System.IO;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    internal class MozuVirtualPathProvider : VirtualPathProvider
    {
        private DjangoMozuViewEngine _djangoVolusionViewEngine;
        List<Tuple<string, string>> _virtMap = new List<Tuple<string, string>>();
        string _themeRoot;

        public MozuVirtualPathProvider(DjangoMozuViewEngine djangoVolusionViewEngine)
        {
            this._djangoVolusionViewEngine = djangoVolusionViewEngine;

            _themeRoot = new DirectoryInfo(HttpRuntime.AppDomainAppPath).Parent.FullName;
        }

        public override string CombineVirtualPaths(string basePath, string relativePath)
        {
            return base.CombineVirtualPaths(basePath, relativePath);
        }
        public override bool DirectoryExists(string virtualDir)
        {
            var path = MapLocalPath(virtualDir);
            return Directory.Exists(path);
        }
        public override System.Web.Caching.CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart)
        {
            return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
        }
        public override string GetCacheKey(string virtualPath)
        {
            return base.GetCacheKey(virtualPath);
        }
        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            if (DirectoryExists(virtualDir) && this.IsLocal(virtualDir))
            {
                string mapPath = MapLocalPath(virtualDir);
                if (mapPath != null)
                    return new MozuVirtualFileSystemDirectory(virtualDir, mapPath);
            }

            return base.GetDirectory(virtualDir);
        }
        public override VirtualFile GetFile(string virtualPath)
        {
            if (FileExists(virtualPath))
            {
                if (this.IsLocal(virtualPath))
                {
                    var mapPath = MapLocalPath(virtualPath);
                    if (mapPath != null)
                    {
                        return new MozuVirtualFileSystemFile(virtualPath, mapPath);
                    }
                }
            }

            return base.GetFile(virtualPath);
        }
        static Dictionary<string, MozuVirtualMongoFile> g_fileCache = new Dictionary<string, MozuVirtualMongoFile>();

        public override bool FileExists(string virtualPath)
        {
            var path = MapLocalPath(virtualPath);
            return File.Exists(path);

        }

        bool IsLocal(string virtualPath)
        {
            return true;
            // string theme = virtualPath.Split('/')[2];
            // return !theme.Contains(':');
        }
        //string MapPath(string virtualPath)
        //{
        //    return MapLocalPath(virtualPath);
        //}
        string MapLocalPath(string virtualPath)
        {
            // TODO: obviously this is a hack, we shouldn't be hard-coding this but for some reason,
            // the code depending on us thinks virtual paths are rooted inside the current theme
            if (virtualPath.IndexOf("~/") == 0)
                virtualPath = virtualPath.Replace("~/", "/");
            else
                virtualPath = "/Themes/Core3/" + virtualPath;


            // wtf? 
            // var pathParts = virtualPath.Replace("\\", "/").Split('/');
            
            //if (pathParts.Length < 3)
            //{
            //    throw new InvalidOperationException(string.Format("invalid path [{0}]", virtualPath));
            //}
            //
            //string theme = pathParts[2];
            //{dev:name}

            string path = _themeRoot + "/Mozu.SiteBuilder.UX.Themes/" + virtualPath.TrimStart('/');
            return path;

        }
    }
}
