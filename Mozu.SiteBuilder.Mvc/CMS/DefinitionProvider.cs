using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Web.Hosting;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public abstract class DefinitionProvider<T> where T : new()
    {
        private readonly VirtualPathProvider _virtualPathProvider;
        private readonly ISiteBuilderContext _sbCtx;
        private readonly DataContractJsonSerializer _serializer = new DataContractJsonSerializer(typeof(T));

        protected DefinitionProvider(VirtualPathProvider virtualPathProvider, ISiteBuilderContext ctx)
        {
            _virtualPathProvider = virtualPathProvider;
            _sbCtx = ctx;
        }

        protected IEnumerable<T> GetFromFolder(string folderName)
        {
            // var baseDirectory = _virtualPathProvider.GetDirectory("/");
            
            // get a VirtualDirectory for the current theme.
            // TODO: massive break of abstraction
            // TODO: this model does not allow themes to inherit their ancestors widgets and page types.
            var baseDirectory = _virtualPathProvider.GetDirectory("~/Themes/" + _sbCtx.Theme.Name);

            var widgetDirectory = baseDirectory.Directories.Cast<VirtualDirectory>().FirstOrDefault(d => string.Equals(d.Name, folderName, StringComparison.OrdinalIgnoreCase));
            if (widgetDirectory == null)
                return Enumerable.Empty<T>();

            return 
                from w in widgetDirectory.Directories.Cast<VirtualDirectory>()
                from x in w.Directories.Cast<VirtualDirectory>()
                select DeserializeFromVirtualFileBase(x);
        }

        protected T DeserializeFromVirtualFileBase(VirtualFileBase basePath)
        {
            VirtualFile definitionFile;

            // if we are provided a directory, attempt to find "definition.json" inside.
            if (basePath is VirtualDirectory)
            {
                definitionFile = ((VirtualDirectory)basePath).Files.Cast<VirtualFile>().FirstOrDefault(f => "definition.json".Equals(f.Name, StringComparison.InvariantCultureIgnoreCase));
            }
            else if (basePath is VirtualFile)
            {
                definitionFile = (VirtualFile)basePath;
            }
            else
            {
                // should be impossible not to be one of the two.
                throw new ArgumentException("Expected a Virtual file or Virtual directory.");
            }

            if (definitionFile == null)
            {
                // TODO: logging
                return new T();
            }

            // TODO: check for 0-bytes files.

            using (var stream = definitionFile.Open())
                return (T) _serializer.ReadObject(stream);
        }
    }
}