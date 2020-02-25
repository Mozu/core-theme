using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Themes;
using System.Threading;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.Localization
{
    public class LocalizationRepository : ILocalizationRepository
    {
        private readonly IMozuVirtualPathProvider _mozuVirtualPathProvider;
        private readonly SiteContext _siteContext;
        private readonly HttpContext _httpContext;
        private readonly ISiteBuilderApiContext _builderApiContext;
        private static readonly ConcurrentDictionary<string, Dictionary<string, Dictionary<string, string>>> _tableCache = new ConcurrentDictionary<string, Dictionary<string, Dictionary<string, string>>>();
        private readonly IThemeContentRetriever _contentRetriever;
        public LocalizationRepository(IMozuVirtualPathProvider mozuVirtualPathProvider , SiteContext siteContext, ISiteBuilderApiContext builderApiContext,
            IThemeContentRetriever contentRetriever, HttpContext httpContext)
        {
            _mozuVirtualPathProvider = mozuVirtualPathProvider;
            _siteContext = siteContext;
            _httpContext = httpContext;
            
            _builderApiContext = builderApiContext;
            _contentRetriever = contentRetriever;
        }

        

        public Dictionary<string, Dictionary<string, string>> GetCollections(string[] keys)
        {
            var userLangs = _httpContext.Request.Headers["Accept-Language"].ToString();
            var languages = userLangs.Split(',');

            if (languages == null || languages.Length == 0)
            {
                return null;
            }

            var culture = CultureInfo.CreateSpecificCulture(languages[0].ToLowerInvariant().Trim());
            var dictKey = _builderApiContext.SiteId + "|" + _siteContext.Theme.Id.ToLower() + "|" + culture.TwoLetterISOLanguageName;

            if (!_tableCache.ContainsKey(dictKey))
            {
                // Language file not loaded. Do it.
                LoadStrings(culture.TwoLetterISOLanguageName);
            }

            if (!_tableCache.TryGetValue(dictKey, out var collections)) return null;
            var retVal = new Dictionary<string, Dictionary<string, string>>();

            foreach (var k in keys)
            {
                Dictionary<string, string> dic;
                if (collections.TryGetValue(k, out dic))
                {
                    retVal.Add(k, dic);
                }
            }

            return retVal.Any() ? retVal : null;
        }

        public string Get(string colKey, string key)
        {
            var userLangs = _httpContext.Request.Headers["Accept-Language"].ToString();
            var languages = userLangs.Split(',');

            if (languages == null || languages.Length == 0)
            {
                return null;
            }

            var culture = CultureInfo.CreateSpecificCulture(languages[0].ToLowerInvariant().Trim());
            var dictKey = _builderApiContext.SiteId + "|" + _siteContext.Theme.Id.ToLower() + "|" + culture.TwoLetterISOLanguageName;

            if (!_tableCache.ContainsKey(dictKey))
            {
                // Language file not loaded. Do it.
                LoadStrings(culture.TwoLetterISOLanguageName);
            }

            // See if there are collections for the current site/theme/language combo
            if (!_tableCache.TryGetValue(dictKey, out var collections)) return null;
            // If so, get the specific collection
            collections.TryGetValue(colKey, out var dic);

            if (dic == null) return null;
            // If the collection exists, try to get the requested string
            dic.TryGetValue(key, out var val);
            return val;

        }

        private void LoadStrings(string language)
        {
            // Walk the theme hierarchy and merge the localization strings down to the currently applied theme
#pragma warning disable 612
            foreach (var theme in _siteContext.Theme.Stack.Reverse())
            {
                var pp = _mozuVirtualPathProvider;
                var stem = "~/themes/" + theme + "/resources/strings/lang-" + language + ".csv";
                var file = pp.GetThemeFileInfo(stem);
               // var file = pp.GetFile(stem) as MozuVirtualFile;
                var dictKey = _builderApiContext.SiteId + "|" + _siteContext.Theme.Id.ToLower() + "|" + language;

                if (file == null) continue;
                var container = new Dictionary<string, Dictionary<string, string>>();

                using var reader = new StreamReader(_contentRetriever.GetStream(file, CancellationToken.None));
                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();

                    if (line == null) continue;
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

                // If there were any entries, add this container
                if (container.Count <= 0) continue;
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
