using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Hosting;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class MozuVirtualFileSystemDirectory : VirtualDirectory
    {
        private string _virtualPath;
        private string _mapPath;

        public MozuVirtualFileSystemDirectory(string virtualPath, string mapPath) : base ( virtualPath )
        {
            _virtualPath = virtualPath;
            _mapPath = mapPath;
        }

        public override System.Collections.IEnumerable Children
        {
            get
            {
                var files = (IEnumerable<VirtualFileBase>)Files;
                var dirs = (IEnumerable<VirtualFileBase>)Directories;

                return files.Concat(dirs);
            }
        }

        public override System.Collections.IEnumerable Directories
        {
            get {
                DirectoryInfo dir = new DirectoryInfo(_mapPath);

                IEnumerable<VirtualDirectory> virtualDirs =
                   from d in dir.GetDirectories()
                   let virtualPath = _virtualPath.TrimEnd('/') + "/" + d.Name + "/"
                   select new MozuVirtualFileSystemDirectory(virtualPath, d.FullName);

                return virtualDirs;
            }
        }

        public override System.Collections.IEnumerable Files
        {
            get {
                DirectoryInfo dir = new DirectoryInfo(_mapPath);

                IEnumerable<VirtualFile> virtualFiles =
                    from f in dir.GetFiles()
                    let virtualPath = _virtualPath.TrimEnd('/') + "/" + f.Name
                    select new MozuVirtualFileSystemFile(virtualPath, f.FullName);

                return virtualFiles;
            }
        }
    }
}
