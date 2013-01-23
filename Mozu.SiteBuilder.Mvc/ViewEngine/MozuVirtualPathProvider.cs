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
    public class MozuVirtualPathProvider : VirtualPathProvider
    {
        private DjangoMozuViewEngine _djangoMozuViewEngine;
        private readonly NameValueCollection _config;
        private Dictionary<string, string> _themeLookup;
        private System.Collections.Concurrent.ConcurrentDictionary<string, FileSystemWatcher> _fileSystemWatchers = new ConcurrentDictionary<string, FileSystemWatcher>(StringComparer.OrdinalIgnoreCase);
        // List<Tuple<string,string>> _virtMap = new List<Tuple<string,string>>();
        // string _themeRoot;


        public MozuVirtualPathProvider(DjangoMozuViewEngine djangoMozuViewEngine, System.Collections.Specialized.NameValueCollection config = null)
        {
            _config = config ?? System.Configuration.ConfigurationManager.AppSettings;

            this._djangoMozuViewEngine = djangoMozuViewEngine;

            InitThemeLookup();
        }
        public IEnumerable<KeyValuePair<string, string>> Themes
        {
            get { return _themeLookup; }
        }
        void InitThemeLookup()
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
                    tl[themeDir.Name] = themeDir.FullName + "\\";
                }
                _fileSystemWatchers.GetOrAdd(parentDir.FullName, CreateWatcher);
            }
            this._themeLookup = tl;
        }

        private FileSystemWatcher CreateWatcher(string path)
        {
            var watcher = new FileSystemWatcher(path)
            {

            };
            watcher.Changed += watcher_Changed;
            watcher.Created += watcher_Changed;
            watcher.Deleted += watcher_Changed;
            watcher.EnableRaisingEvents = true;
            return watcher;
        }

        void watcher_Changed(object sender, FileSystemEventArgs e)
        {
            this.InitThemeLookup();
        }

        private ICollection<string> _themeStack;
        public ICollection<string> ThemeStack
        {
            get { return _themeStack ?? SiteBuilderContext.Current.Theme.Stack; }
            set { _themeStack = value; }
        }


        IEnumerable<string> GetViewVariants(string view, string themeId)
        {
            yield return view;
            if (ThemeStack.Count  == 1 || !themeId.Equals(ThemeStack.First(), StringComparison.OrdinalIgnoreCase))
            {
                var pos = view.LastIndexOf('/');
                if (pos > -1 && pos + 1 < view.Length)
                {
                    yield return view.Substring(0, pos + 1) + "_" + view.Substring(pos + 1);
                }
                else
                {
                    yield return "_" + view;
                }
            }


        }



        public override string CombineVirtualPaths(string basePath, string relativePath)
        {
            return base.CombineVirtualPaths(basePath, relativePath);
        }
        public override bool DirectoryExists(string virtualDir)
        {
            return base.DirectoryExists(virtualDir);
        }
        public override System.Web.Caching.CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart)
        {
            return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
        }
        public override string GetCacheKey(string virtualPath)
        {
            return base.GetCacheKey(virtualPath);
        }

        public string MapLocalPath(string virtualPath, string theme)
        {
            //var pathParts = virtualPath.Replace("\\","/").Split('/');
            //if (pathParts.Length < 3)
            //{
            //    throw new InvalidOperationException(string.Format("invalid path [{0}]", virtualPath));
            //}

            //string theme = pathParts[2];
            //{dev:name}
            return _themeLookup[theme] + virtualPath;


        }
        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            foreach (var theme in this.ThemeStack)
            {
                var fullPath = this.MapLocalPath(virtualDir, theme);
                if (Directory.Exists(fullPath))
                {
                    return new MozuVirtualDirectory(virtualDir, fullPath, this);
                }
            }


            return null;
        }

        public IEnumerable<VirtualFile> GetInheritedFileList(string virtualPath)
        {

            foreach (var theme in this.ThemeStack)
            {
                foreach (var vn in GetViewVariants(virtualPath, theme))
                {
                    var fullPath = this.MapLocalPath(vn, theme);
                    if (System.IO.File.Exists(fullPath))
                    {
                        yield return new MozuVirtualFileSystemFile(virtualPath, fullPath);
                    }

                }
            }
        }

        public override VirtualFile GetFile(string virtualPath)
        {

            foreach (var theme in this.ThemeStack)
            {
                foreach (var vn in GetViewVariants(virtualPath, theme))
                {
                    var fullPath = this.MapLocalPath(vn, theme);
                    if (System.IO.File.Exists(fullPath))
                    {
                        return new MozuVirtualFileSystemFile(virtualPath, fullPath);
                    }

                }
            }

            return null;
        }

        static Dictionary<string, MozuVirtualMongoFile> g_fileCache = new Dictionary<string, MozuVirtualMongoFile>();

        public override bool FileExists(string virtualPath)
        {
            foreach (var theme in this.ThemeStack)
            {
                foreach (var vn in GetViewVariants(virtualPath, theme))
                {
                    var fullPath = this.MapLocalPath(vn, theme);
                    if (File.Exists(fullPath))
                    {
                        return true;
                    }
                }
            }
            return false;

        }







    }

    class MozuVirtualDirectory : System.Web.Hosting.VirtualDirectory
    {
        private string _virtualDir;
        private string _mapPath;
        private MozuVirtualPathProvider _mozuVirtualPathProvider;

        public MozuVirtualDirectory(string virtualDir, string mapPath, MozuVirtualPathProvider mozuVirtualPathProvider)
            : base(virtualDir)
        {
            // TODO: Complete member initialization
            this._virtualDir = virtualDir;
            this._mapPath = mapPath;
            this._mozuVirtualPathProvider = mozuVirtualPathProvider;
        }

        public string MapPath
        {
            get { return _mapPath; }
        }

        public override System.Collections.IEnumerable Children
        {
            get
            {
                HashSet<string> set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var theme in _mozuVirtualPathProvider.ThemeStack)
                {
                    var fullPath = _mozuVirtualPathProvider.MapLocalPath(this.VirtualPath, theme);
                    var di = new DirectoryInfo(fullPath);
                    if (!di.Exists)
                    {
                        continue;
                    }
                    foreach (var item in di.GetFileSystemInfos())
                    {
                        if (set.Contains(item.Name))
                        {
                            continue;
                        }
                        set.Add(item.Name);
                        if (item is DirectoryInfo)
                        {
                            yield return
                                new MozuVirtualDirectory(this.VirtualPath + "/" + item.Name, item.FullName,
                                                           this._mozuVirtualPathProvider);
                        }
                        else
                        {
                            yield return
                           new MozuVirtualFileSystemFile(this.VirtualPath + "/" + item.Name, item.FullName);
                        }
                    }


                }
            }
        }

        public override System.Collections.IEnumerable Directories
        {
            get
            {
                HashSet<string> set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var theme in _mozuVirtualPathProvider.ThemeStack)
                {
                    var fullPath = _mozuVirtualPathProvider.MapLocalPath(this.VirtualPath, theme);
                    var di = new DirectoryInfo(fullPath);
                    if (!di.Exists)
                    {
                        continue;
                    }
                    foreach (var subDir in di.GetDirectories())
                    {
                        if (set.Contains(subDir.Name))
                        {
                            continue;
                        }
                        set.Add(subDir.Name);
                        yield return
                            new MozuVirtualDirectory(this.VirtualPath + "/" + subDir.Name, subDir.FullName,
                                                       this._mozuVirtualPathProvider);
                    }


                }
            }
        }

        public override System.Collections.IEnumerable Files
        {
            get
            {
                HashSet<string> set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var theme in _mozuVirtualPathProvider.ThemeStack)
                {
                    var fullPath = _mozuVirtualPathProvider.MapLocalPath(this.VirtualPath, theme);
                    var di = new DirectoryInfo(fullPath);
                    if (!di.Exists)
                    {
                        continue;
                    }
                    foreach (var file in di.GetFiles())
                    {
                        if (set.Contains(file.Name))
                        {
                            continue;
                        }
                        set.Add(file.Name);
                        yield return
                            new MozuVirtualFileSystemFile(this.VirtualPath + "/" + file.Name, file.FullName);
                    }


                }
            }
        }
    }
}
