using System;
using System.Collections.Generic;
using System.Linq;

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
    }

    public class ThemeFileSystemInfoCollection
    {
        private Dictionary<string, ThemeFileSystemInfo> _allFiles;
        private Dictionary<string, ThemeFileSystemInfo[]> _allFilesNoExt;
       // private ThemeFileSystemInfo[] _liveFileSystemInfos;
        public ThemeFileSystemInfoCollection(IEnumerable<ThemeFileSystemInfo> infos)
        {
            var lst = infos.ToList();
            var files = lst.Where(x => x.IsFile).ToList();
            _allFiles = files.ToDictionary(x => x.VirtualPath, StringComparer.OrdinalIgnoreCase);
            _allFilesNoExt = files.GroupBy(x => x.VirtualPathNoExt).ToDictionary(x => x.Key, y => y.ToArray(), StringComparer.OrdinalIgnoreCase);
            LiveTemplates = files.Where(x => x.FullPath.EndsWith(".live", StringComparison.OrdinalIgnoreCase)).ToArray();
            TimeStamp = files.Count == 0 ? DateTime.MaxValue : files.Max(x => x.TimsStamp);
        }

        public DateTime TimeStamp
        {
            //Count == 0 ? DateTime.MaxValue : tmd.FileListing.Values.Max(x => x.TimsStamp);
            get;
            private set;
        }
       

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
            //.Values ).Where(x => x.FullPath.EndsWith(".live")
            get;
            private set;
        }
    }
}
