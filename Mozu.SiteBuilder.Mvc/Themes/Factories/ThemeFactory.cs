using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using AutoMapper; 

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
                Thumbnail = tmd.Thumbnail,
                ThemePath = tmd.ThemePath ,
                Parent = parent
            };

            if (parent == null)
            {
                theme.MergedSettings = tmd.Configuration.Settings;
                theme.PageTypes = tmd.Configuration.PageTypes;
                theme.Widgets = tmd.Configuration.Widgets;
                theme.MergedLabels = tmd.Labels;
            }
            else
            {
                theme.MergedSettings = Merge<ThemeSetting>(tmd.Configuration.Settings, parent.MergedSettings, setting => setting.Id);
                theme.PageTypes = Merge<PageTypeDefinition>(tmd.Configuration.PageTypes, parent.PageTypes, pt => pt.Id);
                theme.Widgets = Merge<WidgetDefinition>(tmd.Configuration.Widgets, parent.Widgets, widget => widget.Id);
                theme.MergedLabels = MergeLabels(tmd.Labels, parent.MergedLabels);
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

        private Dictionary<string, ThemeLabelCollection> MergeLabels(Dictionary<string, ThemeLabelCollection> themeValues, Dictionary<string, ThemeLabelCollection> parentValues)
        {
            if (themeValues != null && parentValues == null)
                return themeValues;
            else if (themeValues == null && parentValues != null)
                return parentValues;
            else if (themeValues == null && parentValues == null)
                return null;

            Dictionary<string, ThemeLabelCollection> mergedDictionary = new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase);
            foreach (string localeCode in themeValues.Keys.Concat(parentValues.Keys).Distinct())
            {
                mergedDictionary[localeCode] = new ThemeLabelCollection();
                themeValues[localeCode].Each(lb => mergedDictionary[localeCode].Add(lb));
                parentValues[localeCode].Where(lb => !mergedDictionary[localeCode].Contains(lb.Id)).Each(lb => mergedDictionary[localeCode].Add(lb));
            }

            return mergedDictionary;
        }
    }
}
