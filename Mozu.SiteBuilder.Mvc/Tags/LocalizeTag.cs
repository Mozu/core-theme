using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.Localization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("localize")]
    public class LocalizeTag: DynamicTagBase
    {
        private readonly LocalizationRepository _localizationRepository = null;
        
        public LocalizeTag()
        {
            _localizationRepository = new LocalizationRepository();
        }

        public string Process(string colKey, string key)
        {
            return _localizationRepository.Get(colKey, key);
        }

        public string Process(string colKey, string key, string defaultValue)
        {
            return Process(colKey, key) ?? defaultValue;
        }
    }
}
