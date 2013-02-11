using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.Localization
{
    public class LocalizationRepository : ILocalizationRepository
    {
        private readonly MozuVirtualPathProvider _mozuVirtualPathProvider;
        private static readonly ConcurrentDictionary<string, Dictionary<string, Dictionary<string, string>>> _tableCache = new ConcurrentDictionary<string, Dictionary<string, Dictionary<string, string>>>();
        
        public LocalizationRepository(MozuVirtualPathProvider mozuVirtualPathProvider)
        {
            _mozuVirtualPathProvider = mozuVirtualPathProvider;
        }

        public void ClearCache()
        {
            _tableCache.Clear();
        }

        public void ClearSiteCache()
        {
            ISiteBuilderContext siteContext = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

            foreach (var k in from k in _tableCache.Keys let parts = k.Split('|') where int.Parse(parts[0]) == siteContext.SiteId select k)
            {
                Dictionary<string, Dictionary<string, string>> dic;
                _tableCache.TryRemove(k, out dic);
            }
        }

        public void ClearSiteCache(string language)
        {
            ISiteBuilderContext siteContext = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

            var dictKey = siteContext.SiteId + "|" + siteContext.Theme.Id.ToLower() + "|" + language;
            Dictionary<string, Dictionary<string, string>> dic;
            _tableCache.TryRemove(dictKey, out dic);
        }

        public Dictionary<string, Dictionary<string, string>> GetCollections(string[] keys)
        {
            var languages = HttpContext.Current.Request.UserLanguages;
            ISiteBuilderContext siteContext = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

            if (languages == null || languages.Length == 0)
            {
                return null;
            }

            var culture = CultureInfo.CreateSpecificCulture(languages[0].ToLowerInvariant().Trim());
            var dictKey = siteContext.SiteId + "|" + siteContext.Theme.Id.ToLower() + "|" + culture.TwoLetterISOLanguageName;

            if (!_tableCache.ContainsKey(dictKey))
            {
                // Language file not loaded. Do it.
                LoadStrings(culture.TwoLetterISOLanguageName);
            }

            Dictionary<string, Dictionary<string, string>> collections;

            if (_tableCache.TryGetValue(dictKey, out collections))
            {
                var retVal = new Dictionary<string, Dictionary<string, string>>();

                foreach (var k in keys)
                {
                    Dictionary<string, string> dic;
                    if (collections.TryGetValue(k, out dic))
                    {
                        retVal.Add(k, dic);
                    }
                }

                if(retVal.Any())
                {
                    return retVal;
                }
            }

            return null;
        }

        public string Get(string colKey, string key)
        {
            var languages = HttpContext.Current.Request.UserLanguages;
            ISiteBuilderContext siteContext = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

            if (languages == null || languages.Length == 0)
            {
                return null;
            }

            var culture = CultureInfo.CreateSpecificCulture(languages[0].ToLowerInvariant().Trim());
            var dictKey = siteContext.SiteId + "|" + siteContext.Theme.Id.ToLower() + "|" + culture.TwoLetterISOLanguageName;

            if (!_tableCache.ContainsKey(dictKey))
            {
                // Language file not loaded. Do it.
                LoadStrings(culture.TwoLetterISOLanguageName);
            }

            Dictionary<string, Dictionary<string, string>> collections;

            // See if there are collections for the current site/theme/language combo
            if (_tableCache.TryGetValue(dictKey, out collections))
            {
                // If so, get the specific collection
                Dictionary<string, string> dic;
                collections.TryGetValue(colKey, out dic);

                if(dic != null)
                {
                    // If the collection exists, try to get the requested string
                    string val;
                    dic.TryGetValue(key, out val);
                    return val;
                }
            }

            return null;
        }

        private void LoadStrings(string language)
        {
            ISiteBuilderContext siteContext = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

            // Walk the theme hierarchy and merge the localization strings down to the currently applied theme
            foreach (var theme in siteContext.Theme.Stack.Reverse())
            {
                var pp = _mozuVirtualPathProvider;
                var stem = "~/themes/" + theme + "/resources/strings/lang-" + language + ".csv";
                var file = pp.GetFile(stem) as MozuVirtualFile;
                var dictKey = siteContext.SiteId + "|" + siteContext.Theme.Id.ToLower() + "|" + language;

                if (file != null && file.Exists)
                {
                    var container = new Dictionary<string, Dictionary<string, string>>();

                    using (var reader = new StreamReader(file.Open()))
                    {
                        while (!reader.EndOfStream)
                        {
                            var line = reader.ReadLine();

                            if (line != null)
                            {
                                var parts = line.Split('|');

                                if (parts.Length != 3)
                                {
                                    throw new Exception("Localization file format is corrupt.");
                                }

                                // See if the container has an entry for the current item's collection
                                if (!container.ContainsKey(parts[2]))
                                {
                                    // Collection was not found. Add it.
                                    container.Add(parts[2], new Dictionary<string, string>());
                                }

                                // Get the collection
                                var col = container[parts[2]];

                                if (!col.ContainsKey(parts[0]))
                                {
                                    // New entry
                                    col.Add(parts[0], parts[1]);
                                }
                                else
                                {
                                    // Update entry
                                    col[parts[0]] = parts[1];
                                }
                            }
                        }

                        // If there were any entries, add this container
                        if (container.Count > 0)
                        {
                            if (!_tableCache.ContainsKey(dictKey))
                            {
                                _tableCache.TryAdd(dictKey, container);
                            }
                            else
                            {
                                _tableCache[dictKey] = container;
                            }
                        }
                    }
                }
            }
        }
    }
}
