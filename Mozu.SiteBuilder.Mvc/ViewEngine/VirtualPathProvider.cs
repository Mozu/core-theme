using System;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class VirtualPathProvider
    {
        public virtual VirtualDirectory GetDirectory(string virtualDir)
        {
            throw new NotImplementedException();
        }
        public virtual VirtualFile GetFile(string virtualPath)
        {
            throw new NotImplementedException();
        }
        public virtual bool FileExists(string virtualPath)
        {
            throw new NotImplementedException();
        }
    }
}