using System;
using System.Linq;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public class ThemeRuntimeSettingsCollection
    {
        public List<ThemeRuntimeSetting> Settings { get; set; }

        public object this[string id]
        {
            get
            {
                if (Settings == null)
                    return null;

                if (Settings.Any(s => s.Setting.Id == id))
                    return Settings.First(s => s.Setting.Id == id).Value;

                return null;
            }
        }

        /// <summary>
        /// Public constructor
        /// </summary>
        public ThemeRuntimeSettingsCollection() { }

        /// <summary>
        /// Public constructor
        /// </summary>
        public ThemeRuntimeSettingsCollection(List<ThemeRuntimeSetting> collection)
        {
            Settings = collection;
        }

        public Dictionary<string, object> AsDictionary()
        {
            var dict = new Dictionary<string, object>();

            if (Settings == null)
                return dict;

            Settings.ForEach(s => dict.Add(s.Setting.Id, s.Value));
            return dict;
        }
    }
}
