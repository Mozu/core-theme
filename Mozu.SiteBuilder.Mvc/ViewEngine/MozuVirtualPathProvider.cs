using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Web.Hosting;
using System.Web;
using System.IO;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
     public class MozuVirtualPathProvider : VirtualPathProvider
    {
         private readonly ISiteBuilderContext _siteBuilderContext;
         //private readonly IThemeRepository _themeRepository;
 

        public MozuVirtualPathProvider(ISiteBuilderContext siteBuilderContext)
        {
            _siteBuilderContext = siteBuilderContext;
        }

        //todo:refactor to use themefileinfos
        public string MapLocalPath(string virtualPath, Theme  theme)
        {
            var t = theme;
            return t.ThemePath +"\\"  + virtualPath;
        }


        

        public ICollection<Theme> ThemeStack
        {
            get
            {
                
                if (_siteBuilderContext.IsDisposed)
                {
                    throw new InvalidOperationException("irk");
                }

                return (_siteBuilderContext).Theme.Stack;
            }
        }
       
        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            var fileInfo = GetThemeFileInfo(virtualDir);
            if (fileInfo != null)
            {
                return new MozuVirtualDirectory(fileInfo.VirtualPath, fileInfo.FullPath, this);
            }
            return null;
        }

       
         public override VirtualFile GetFile(string virtualPath)
         {
             return GetFile(virtualPath, true);
         }
        public  VirtualFile GetFile(string virtualPath, bool withExt   )
        {
            var fileInfo = GetThemeFileInfo(virtualPath, withExt);
            if (fileInfo != null)
            {
                return new MozuVirtualFileSystemFile(fileInfo.VirtualPath, fileInfo.FullPath );
            }
            return null;
        }

         public IEnumerable<ThemeFileSystemInfo> GetLveTemplates()
         {
             return this.ThemeStack.SelectMany(x=> x.FileListing ).Where(x => x.FullPath.EndsWith(".live")).Where(x => GetThemeFileInfo(x.VirtualPathNoExt, false) == x);
            
         }

         public ThemeFileSystemInfo GetThemeFileInfo(string virtualPath, bool withExt = true  )
         {
             virtualPath = virtualPath.ToLowerInvariant().Replace("/", "\\").Trim(new char[] {'\\'});
            if (!withExt)
            {
                virtualPath = virtualPath.GetFilePathNameWithoutExtension();
            }
            foreach (var theme in this.ThemeStack)
            {
                    var file = theme.FileListing.FirstOrDefault( x => withExt ? x.VirtualPath == virtualPath : (x.VirtualPathNoExt == virtualPath && x.IsFile));

                    if (file != null )
                    {
                        return file;
                    }
            }
            return null;

         }

        static Dictionary<string, MozuVirtualMongoFile> g_fileCache = new Dictionary<string, MozuVirtualMongoFile>();

         public override bool FileExists(string virtualPath)
         {
             return FileExists(virtualPath, true);
         }

         public  bool FileExists(string virtualPath, bool withExt )
         {
             return GetThemeFileInfo(virtualPath, withExt) != null;

         }
          

         private const string HTTP_ITEMS_KEY = "MOZUVIRPATPROV";

        internal void StoreInContext(HttpContextBase ctx)
        {
            ctx.Items[HTTP_ITEMS_KEY] = this;
            
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
                    var exists = theme.FileListing.Any(x => x.VirtualPath == this.VirtualPath);




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
