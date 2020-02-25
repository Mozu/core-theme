using System;
using System.IO;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public abstract class VirtualFile
    {
        public VirtualFile(string path)
        {

        }

        public virtual Stream Open()
        {
            throw new NotImplementedException();
        }
    }
}