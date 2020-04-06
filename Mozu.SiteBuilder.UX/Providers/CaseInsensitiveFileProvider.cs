using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;

namespace Mozu.SiteBuilder.UX.Providers
{
    internal class CaseInsensitivePhysicalFileProvider : IFileProvider
    {
        Dictionary<string, string> _lookup;
        PhysicalFileProvider Inner;
        public CaseInsensitivePhysicalFileProvider(string root)
        {

            Inner = new PhysicalFileProvider(root);

            _lookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var file in Directory.GetFiles(root, "*.*", SearchOption.AllDirectories)
                .Select(_ => _.Substring(root.Length)))
            {
                _lookup[file] = file;
            }

        }

        public IDirectoryContents GetDirectoryContents(string subpath)
        {
            return ((IFileProvider)Inner).GetDirectoryContents(subpath);
        }

        public IFileInfo GetFileInfo(string subpath)
        {
            var res = ((IFileProvider)Inner).GetFileInfo(subpath);
            if (!res.Exists && _lookup.TryGetValue(subpath, out string casedPath))
            {
                return ((IFileProvider)Inner).GetFileInfo(casedPath);
            }
            return res;
        }

        public IChangeToken Watch(string filter)
        {
            return null;
        }

        IChangeToken IFileProvider.Watch(string filter)
        {
            throw new System.NotImplementedException();
        }
    }

}
