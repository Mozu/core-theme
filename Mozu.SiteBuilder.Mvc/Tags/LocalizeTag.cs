using System;
using Mozu.SiteBuilder.Mvc.Localization;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [Obsolete]
    [Name("localize")]
    public class LocalizeTag: SimpleTagBase 
    {
        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            var repo = context.Resolve<ILocalizationRepository>();
            var colKey = (string)arguments[0].Value;
            var key = (string)arguments[1].Value;
            string defaultValue = null;
            if (arguments.Count > 2)
            {
                defaultValue = (string)arguments[2].Value;
            }
            var buffer = repo.Get(colKey, key) ?? defaultValue;

            return new ProcessTagResult(context){Buffer = buffer, Template = null};
        }
    }
}
