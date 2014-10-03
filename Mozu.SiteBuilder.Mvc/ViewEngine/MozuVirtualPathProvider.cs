using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Hosting;
using System.Web;
using System.IO;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
     public class MozuVirtualPathProvider : VirtualPathProvider
    {
         private readonly SiteContext _siteContext;
         
         //private readonly IThemeRepository _themeRepository;
 

        public MozuVirtualPathProvider(SiteContext  siteContext)
        {
            _siteContext = siteContext;
        
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

#pragma warning disable 612
                return (_siteContext).Theme.Stack;
            }
        }
       
        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            var fileInfo = GetThemeFileInfo(virtualDir);
            return fileInfo != null ? new MozuVirtualDirectory(fileInfo.VirtualPath, fileInfo.FullPath, this) : null;
        }

         public override VirtualFile GetFile(string virtualPath)
         {
             return GetFile(virtualPath, true);
         }
        public  VirtualFile GetFile(string virtualPath, bool withExt   )
        {
            var fileInfo = GetThemeFileInfo(virtualPath, withExt);
            return fileInfo != null ? new MozuVirtualFileSystemFile(fileInfo.VirtualPath, fileInfo.FullPath) : null;
        }

         public IEnumerable<ThemeFileSystemInfo> GetLveTemplates()
         {
             return ThemeStack.SelectMany(x=> x.FileListing.LiveTemmplates ).Where(x => GetThemeFileInfo(x.VirtualPathNoExt, false) == x);
         }

         public ThemeFileSystemInfo GetThemeFileInfo(string virtualPath, bool withExt = true  )
         {
             virtualPath = virtualPath.ToLowerInvariant().Replace("/", "\\").Trim(new char[] {'\\'});
            if (!withExt)
            {
                virtualPath = virtualPath.GetFilePathNameWithoutExtension();
            }
             return ThemeStack.Select(theme => theme.FileListing.GetFileInfo(virtualPath, withExt)).FirstOrDefault(file => file != null);
         }

         public ThemeFileSystemInfo GetParentThemeFileInfo(ThemeFileSystemInfo item )
         {
             var parentTheme = ThemeStack.FirstOrDefault(theme => theme.Id.EqualsIgnoreCase(item.ThemeId));
             if (parentTheme == null) return null;
             
             return parentTheme.FileListing.GetFileInfo(item.VirtualPathNoExt, false);
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
                    var exists = theme.FileListing.Exists(this.VirtualPath);




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
