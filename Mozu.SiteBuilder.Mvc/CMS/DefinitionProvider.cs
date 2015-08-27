using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Web.Hosting;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public abstract class DefinitionProvider<T> where T : new()
    {
        private readonly VirtualPathProvider _virtualPathProvider;
        
        private readonly JsonSerializer _serializer = new Newtonsoft.Json.JsonSerializer();

        protected DefinitionProvider(VirtualPathProvider virtualPathProvider)
        {
            _virtualPathProvider = virtualPathProvider;
            
            
        }

        protected IEnumerable<T> GetFromFolder( string  folderName)
        {
            // var baseDirectory = _virtualPathProvider.GetDirectory("/");
            
            // get a VirtualDirectory for the current theme.
            // TODO: massive break of abstraction
           
            var virtDir = _virtualPathProvider.GetDirectory(folderName);
          
          
         
            if (virtDir == null)
                yield break;
            var dirs = new Queue<VirtualDirectory>();
            foreach (VirtualDirectory dir in virtDir.Directories)
            {
                dirs.Enqueue(dir);
            }

            while (dirs.Count > 0)
            {
                var dir = dirs.Dequeue();

                var definitionFile = dir.Files.Cast<VirtualFile>().FirstOrDefault(f => "definition.json".Equals(f.Name, StringComparison.InvariantCultureIgnoreCase));
                if (definitionFile != null)
                {
                    yield return DeserializeFromVirtualFileBase(definitionFile);
                }
                else 
                {
                    foreach (VirtualDirectory subDir in dir.Directories)
                    {
                        dirs.Enqueue(subDir);
                    }
                }
            }
            
            


        }

        protected T DeserializeFromVirtualFileBase(VirtualFileBase basePath)
        {
            VirtualFile definitionFile;
            
            // if we are provided a directory, attempt to find "definition.json" inside.
            if (basePath is VirtualDirectory)
            {
                definitionFile = ((VirtualDirectory)basePath).Files.Cast<VirtualFile>().FirstOrDefault(f => "definition.json".Equals(f.Name, StringComparison.InvariantCultureIgnoreCase));
                if (definitionFile == null && ((VirtualDirectory) basePath).Directories != null )
                {
                    
                }
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