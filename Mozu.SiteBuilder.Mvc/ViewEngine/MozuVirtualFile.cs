using System;
using System.Web.Hosting;
using System.IO;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public abstract class MozuVirtualFile : VirtualFile
    {
        public MozuVirtualFile(string virtualPath) : base(virtualPath) { }

        public abstract DateTime GetLastWriteTime();

        public abstract bool Exists
        {
            get;
        }
    }

    public class MozuVirtualFileSystemFile : MozuVirtualFile
    {
        private string virtualPath;

        public override bool Exists
        {
            get { return File.Exists(this.MappedPath); }
        }

        public MozuVirtualFileSystemFile(string virtualPath, string mapPath)
            : base(virtualPath)
        {
            // TODO: Complete member initialization
            this.virtualPath = virtualPath;
            this.MappedPath = mapPath;
        }

        public string MappedPath
        {
            get;
            set;
        }

        public override DateTime GetLastWriteTime()
        {
            return File.GetLastWriteTime(MappedPath);
        }

        public override System.IO.Stream Open()
        {
            return File.Open(MappedPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        }
    }

    public class MozuVirtualMongoFile : MozuVirtualFile
    {
        private string virtualPath;

        public override bool Exists
        {
            get { return Content != null; }
        }

        public MozuVirtualMongoFile(string virtualPath, DateTime? lastWriteTime = null, byte[] content = null)
            : base(virtualPath)
        {
            this.virtualPath = virtualPath;
            this.Content = content;
            this.LastWriteTime = lastWriteTime.HasValue ? lastWriteTime.Value : DateTime.MaxValue;
        }

        public DateTime LastWriteTime
        {
            get;
            set;
        }

        public byte[] Content
        {
            get;
            set;
        }

        public override Stream Open()
        {
            return new MemoryStream(Content);
        }

        public override DateTime GetLastWriteTime()
        {
            return LastWriteTime;
        }
    }
}
