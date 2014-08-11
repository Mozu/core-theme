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
                AllowProduction = tmd.Configuration.About.AllowProduction,
                IsMobile = tmd.Configuration.About.IsMobile,
                IsTablet = tmd.Configuration.About.IsTablet,
                DefaultLanguage = tmd.Configuration.About.DefaultLanguage ?? "en-US",
                Thumbnail = tmd.Thumbnail,
                ThemePath = tmd.ThemePath ,
                TimeStamp = tmd.TimeStamp,
                Parent = parent
            };

            if (parent == null)
            {
                theme.MergedSettings = tmd.Configuration.Settings;
                theme.PageTypes = tmd.Configuration.PageTypes;
                theme.EmailTemplates = tmd.Configuration.EmailTemplates;
                theme.Widgets = tmd.Configuration.Widgets;
                theme.Editors = tmd.Configuration.Editors;
                theme.MergedLabels = tmd.Labels;

            }
            else
            {
                theme.MergedSettings = Merge<ThemeSetting>(tmd.Configuration.Settings, parent.MergedSettings, setting => setting.Id);
                theme.PageTypes = Merge<PageTypeDefinition>(tmd.Configuration.PageTypes, parent.PageTypes, pt => pt.Id);
                theme.EmailTemplates = Merge<PageTypeDefinition>(tmd.Configuration.EmailTemplates, parent.EmailTemplates, pt => pt.Id);
                theme.Editors = Merge<EditorDefinition>(tmd.Configuration.Editors, parent.Editors, pt => pt.Id);
                theme.Widgets = Merge<WidgetDefinition>(tmd.Configuration.Widgets, parent.Widgets, widget => widget.Id);
                theme.MergedLabels = MergeLabels(tmd.Labels, parent.MergedLabels);
          
                theme.TimeStamp = parent.TimeStamp > theme.TimeStamp ? parent.TimeStamp : theme.TimeStamp;
            }

            theme.FileListing = tmd.FileListing;
            SetFallbackLocales(theme);
            return theme;
        }

        private void SetFallbackLocales(Theme t)
        {
            ThemeLabelCollection defaultCollection;
            if (!t.MergedLabels.TryGetValue(t.DefaultLanguage, out defaultCollection))
            {
                defaultCollection = new ThemeLabelCollection();
                t.MergedLabels[t.DefaultLanguage] = defaultCollection;
            }
            foreach (var themeCollection in t.MergedLabels.Where(x=> !string.Equals(t.DefaultLanguage , x.Key )).Select(x=> x.Value))
            {
                foreach ( var key in defaultCollection.Keys)
                {
                    if (!themeCollection.ContainsKey(key))
                    {
                        themeCollection[key] = defaultCollection[key];
                    }
                }
            }
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
                if (themeValues.ContainsKey(localeCode))
                {
                    themeValues[localeCode].Each(lb => mergedDictionary[localeCode].Add(lb.Key, lb.Value));
                }
                if (parentValues.ContainsKey(localeCode))
                {
                    parentValues[localeCode].Where(lb => !mergedDictionary[localeCode].ContainsKey(lb.Key )).Each(lb => mergedDictionary[localeCode].Add(lb.Key,lb.Value));
                }
            }

            return mergedDictionary;
        }
    }
}
