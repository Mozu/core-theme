using Mozu.SiteBuilder.Mvc.Extensions;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Information about a theme loaded directly from the filesystem.
    /// An instance of this class is passed into ThemeFactory to make a Theme.
    /// </summary>
    internal class ThemeMetaData
    {
        public string Id { get; set; }
        public string ThemePath { get; set; }
        public ThemeConfiguration Configuration { get; set; }
        public Thumbnail Thumbnail { get; set; }
        public Dictionary<string, ThemeLabelCollection> Labels { get; set; }

      
        public ThemeFileSystemInfoCollection FileListing { get; set; }

        public DateTime TimeStamp { get; set; }
        public string Hash { get; set; }
    }
    [JsonConverter(typeof(ThemeFileSystemInfoCollection.ThemeFileSystemInfoCollectionJsonConverter))]
    public class ThemeFileSystemInfoCollection
    {

        public void UnionWith(ThemeFileSystemInfoCollection set )
        {
            
            if (set._allFiles == this._allFiles ||  set._allFiles == null)
            {
                return;
            }

            var total = new Dictionary<string, ThemeFileSystemInfo>( StringComparer.OrdinalIgnoreCase);
            if ( _allFiles != null)
            {
                foreach (var kvp in this._allFiles)
                {
                    total[kvp.Key] = kvp.Value;
                }
            }

            foreach (var kvp in set._allFiles)
            {
                if (!total.ContainsKey(kvp.Key))
                {
                    total.Add(kvp.Key, kvp.Value);
                }
            }
            this._allFiles = total;
               
        }
        public class ThemeFileSystemInfoCollectionJsonConverter : JsonConverter
        {

            public override bool CanConvert(Type objectType)
            {
                return true;
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                var data = serializer.Deserialize<DataAccssModel>(reader);
                return new ThemeFileSystemInfoCollection(data.Files, data.TimeStamp, data.Hash);

            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                var tfsic = (ThemeFileSystemInfoCollection)value;
                var dam = new DataAccssModel()
                {
                    Files = tfsic._allFiles.Values.ToList(),
                    Hash = tfsic.Hash,
                    TimeStamp = tfsic.TimeStamp
                };
                serializer.Serialize(writer, dam);
            }
        }
        public class DataAccssModel
        {
            public List<ThemeFileSystemInfo> Files { get; set; }
            public string Hash { get; set; }
            public DateTime? TimeStamp { get; set; }
        }

        private Dictionary<string, ThemeFileSystemInfo> _allFiles;
        private Dictionary<string, ThemeFileSystemInfo[]> _allFilesNoExt;
       // private ThemeFileSystemInfo[] _liveFileSystemInfos;

       internal IEnumerable<ThemeFileSystemInfo> InternalFiles { get { return _allFiles.Values; } } 
        public ThemeFileSystemInfoCollection(IEnumerable<ThemeFileSystemInfo> infos, DateTime? timeStamp, string Hash)
        {
            var lst = infos.ToList();
            var files = lst.Where(x => x.IsFile).ToList();
            _allFiles = files.ToDictionar2y(x => x.VirtualPath,y=> y, StringComparer.OrdinalIgnoreCase);
            _allFilesNoExt = files.GroupBy(x => x.VirtualPathNoExt,StringComparer.OrdinalIgnoreCase).ToDictionar2y(x => x.Key, y => y.ToArray(), StringComparer.OrdinalIgnoreCase);
            LiveTemplates = files.Where(x => x.VirtualPath.EndsWith(".live", StringComparison.OrdinalIgnoreCase)).ToArray();
            TimeStamp = timeStamp ??  (files.Count == 0 ? DateTime.MaxValue : files.Max(x => x.TimsStamp));
            Hash = Hash ?? LegacyHash(files);
        }
      
        string LegacyHash (IEnumerable<ThemeFileSystemInfo> files  )
        {
            if ( files == null)
            {
                return string.Empty;
            }


            using (var md5 = MD5.Create())
            using (var stream = new MemoryStream())
            using (var w = new BinaryWriter(stream))
            {
                files.ToList().ForEach(_ =>
                {
                    w.Write(_.VirtualPath ?? string.Empty);
                    w.Write(_.TimsStamp.Ticks );
                });
                w.Flush();
                stream.Position = 0;
                var hash = md5.ComputeHash(stream);
                return hash.ToHexString();
            }
           
        }

       

        public DateTime TimeStamp
        {
            //Count == 0 ? DateTime.MaxValue : tmd.FileListing.Values.Max(x => x.TimsStamp);
            get;
            private set;
        }
        public string Hash
        { get; set; }



        public ThemeFileSystemInfo GetFileInfo(string virtualPath, bool withExt)
        {
           
            if (withExt)
            {
                ThemeFileSystemInfo info;
                if (_allFiles.TryGetValue(virtualPath, out info))
                {
                    return info;
                }
                return null;
    
            }
            ThemeFileSystemInfo[] infos;
            if (_allFilesNoExt.TryGetValue(virtualPath, out infos))
            {
                return infos.FirstOrDefault();
            }
            return null;
         
            //theme.FileListing.FirstOrDefault( x => withExt ? x.VirtualPath == virtualPath : (x.VirtualPathNoExt == virtualPath && x.IsFile));     
        }


        internal object Exists(string p)
        {
            return GetFileInfo(p, true) != null;
        }

        public IEnumerable<ThemeFileSystemInfo> LiveTemplates
        {
            get;
            private set;
        }
    }
}
