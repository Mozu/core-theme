using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
   
    internal class ThemeFactory 
    {
        
        //  private List<Theme> _themes;
        private Dictionary<string, Theme> _stackOverFlowCheckDictionary = new Dictionary<string, Theme>(StringComparer.OrdinalIgnoreCase ); 

        public Theme Build(ThemeMetaData tmd, Theme parent)
        {
            var theme = new Theme {
                Source = tmd,
                Id = tmd.Id,
                Name = tmd.Configuration.About.Name,
                Author = tmd.Configuration.About.Author,
                IsDesktop = tmd.Configuration.About.IsDesktop,
                IsMobile = tmd.Configuration.About.IsMobile,
                Parent = parent
            };

            if (parent == null)
            {
                theme.MergedSettings = tmd.Configuration.Settings;
                theme.PageTypes = tmd.Configuration.PageTypes;
                theme.Widgets = tmd.Configuration.Widgets;
            }
            else
            {
                theme.MergedSettings = Merge<ThemeSetting>(tmd.Configuration.Settings, parent.MergedSettings, setting => setting.Id);
                theme.PageTypes = Merge<PageTypeDefinition>(tmd.Configuration.PageTypes, parent.PageTypes, pt => pt.Id);
                theme.Widgets = Merge<WidgetDefinition>(tmd.Configuration.Widgets, parent.Widgets, widget => widget.Id);
            }

            theme.FileListing = tmd.FileListing;

            return theme;
        }

        private List<TOut> Merge<TOut>(List<TOut> themeValues, List<TOut> parentValues, Func<TOut, string> identifierMember)
        {
            var output = new Dictionary<string, TOut>();

            // start with all the parent settings in a list.
            if (parentValues != null)
                parentValues.ForEach(parentValue => output[identifierMember.Invoke(parentValue)] = parentValue);

            // overwrite any parent settings with settings defined in this theme.
            if (themeValues != null)
                themeValues.ForEach(themeValue => output[identifierMember.Invoke(themeValue)] = themeValue);

            return output.Values.ToList();
        }
    }
}
