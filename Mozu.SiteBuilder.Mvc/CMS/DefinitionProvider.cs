using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Web.Hosting;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public abstract class DefinitionProvider<T> where T : new()
    {
        private readonly VirtualPathProvider _virtualPathProvider;
        private readonly ISiteBuilderContext _sbCtx;
        private readonly JsonSerializer _serializer = new Newtonsoft.Json.JsonSerializer();

        protected DefinitionProvider(VirtualPathProvider virtualPathProvider, ISiteBuilderContext ctx)
        {
            _virtualPathProvider = virtualPathProvider;
            _sbCtx = ctx;
            
        }

        protected IEnumerable<T> GetFromFolder( string  folderName)
        {
            // var baseDirectory = _virtualPathProvider.GetDirectory("/");
            
            // get a VirtualDirectory for the current theme.
            // TODO: massive break of abstraction
            // TODO: this model does not allow themes to inherit their ancestors widgets and page types.
            var virtDir = _virtualPathProvider.GetDirectory(folderName);
          
          
          
            if (virtDir == null)
                return Enumerable.Empty<T>();

            return
                from w in virtDir.Directories.Cast<VirtualDirectory>()
                select DeserializeFromVirtualFileBase(w);
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
            {
                if (stream.Length == 0)
                    return new T();
                var sr = new StreamReader(stream);
                var reader = new JsonTextReader(sr);
                return _serializer.Deserialize<T>(reader);
                // return  JsonConvert.DeserializeObject<T>(stream);

            }
        }
    }
}