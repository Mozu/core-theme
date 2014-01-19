using System;
using Autofac;

using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.Localization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [Obsolete]
    [NDjango.Interfaces.Name("localize")]
    public class LocalizeTag: SimpleTagBase 
    {
        private readonly ILocalizationRepository _localizationRepository = null;


        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            templateName = null;
            var repo = context.Resolve<ILocalizationRepository>();
            string colKey = (string)arguments[0].Value;
            string key = (string)arguments[1].Value;
            string defaultValue = null;
            if (arguments.Count > 2)
            {
                defaultValue = (string)arguments[2].Value;
            }
            buffer = _localizationRepository.Get(colKey, key) ?? defaultValue;
        }

      
    }
}
