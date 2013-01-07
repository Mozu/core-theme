using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Localization
{
    public interface ILocalizationRepository
    {
        void ClearCache();
        void ClearSiteCache();
        void ClearSiteCache(string language);
        Dictionary<string, Dictionary<string, string>> GetCollections(string[] keys);
        string Get(string colKey, string key);
    }
}