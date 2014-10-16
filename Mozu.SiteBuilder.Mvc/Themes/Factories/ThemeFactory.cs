using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
    internal static class ThemeFactory 
    {
        private const string DefaultThemeLanguage = "en-US";

        public static Theme Build(ThemeMetaData tmd, Theme parent)
        {
            // top-level properties
            var theme = new Theme {
                Source = tmd,
                Id = tmd.Id,
                Thumbnail = tmd.Thumbnail,
                ThemePath = tmd.ThemePath ,
                TimeStamp = tmd.TimeStamp,
                Parent = parent,
                DefaultLanguage = DefaultThemeLanguage,
                MergedLabels = tmd.Labels ?? new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase){{DefaultThemeLanguage, new ThemeLabelCollection()}}, // assign default labels collection
                FileListing = tmd.FileListing
            };

            if (parent != null)
            {
                theme.MergedLabels = MergeLabels(tmd.Labels, parent.MergedLabels);
                theme.TimeStamp = parent.TimeStamp > theme.TimeStamp ? parent.TimeStamp : theme.TimeStamp;
            }

            // things that require configuration
            if (tmd.Configuration != null)
            {
                if (tmd.Configuration.About != null)
                {
                    theme.Name = tmd.Configuration.About.Name;
                    theme.Author = tmd.Configuration.About.Author;
                    theme.IsDesktop = tmd.Configuration.About.IsDesktop;
                    theme.AllowProduction = tmd.Configuration.About.AllowProduction;
                    theme.IsMobile = tmd.Configuration.About.IsMobile;
                    theme.IsTablet = tmd.Configuration.About.IsTablet;
                    theme.DefaultLanguage = tmd.Configuration.About.DefaultLanguage ?? DefaultThemeLanguage;
                }

                if (parent == null)
                {
                    theme.MergedSettings = tmd.Configuration.Settings;
                    theme.PageTypes = tmd.Configuration.PageTypes;
                    theme.EmailTemplates = tmd.Configuration.EmailTemplates;
                    theme.Widgets = tmd.Configuration.Widgets;
                    theme.Editors = tmd.Configuration.Editors;
                }
                else
                {
                    theme.MergedSettings = Merge(tmd.Configuration.Settings, parent.MergedSettings, setting => setting.Id);
                    theme.PageTypes = Merge(tmd.Configuration.PageTypes, parent.PageTypes, pt => pt.Id);
                    theme.EmailTemplates = Merge(tmd.Configuration.EmailTemplates, parent.EmailTemplates, pt => pt.Id);
                    theme.Editors = Merge(tmd.Configuration.Editors, parent.Editors, pt => pt.Id);
                    theme.Widgets = Merge(tmd.Configuration.Widgets, parent.Widgets, widget => widget.Id);                   
                }
            }
            
            EnsureDefaultLabelCollection(theme);
            SetFallbackLocales(theme);
            return theme;
        }

        private static void SetFallbackLocales(Theme t)
        {
            var defaultCollection = t.MergedLabels[t.DefaultLanguage];
            foreach (var themeCollection in t.MergedLabels.Where(x => !t.DefaultLanguage.EqualsIgnoreCase(x.Key)).Select(x => x.Value))
            {
                themeCollection.AddRange(
                        defaultCollection.Keys
                        .Where(x => !themeCollection.ContainsKey(x))
                        .ToDictionary(x => x, y => defaultCollection[y]));
            }
        }

        private static void EnsureDefaultLabelCollection(Theme t)
        {
            if (t.MergedLabels.ContainsKey(t.DefaultLanguage)){ return; }
            t.MergedLabels[t.DefaultLanguage] = new ThemeLabelCollection();
        }

        private static List<TOut> Merge<TOut>(IEnumerable<TOut> themeValues, IEnumerable<TOut> parentValues, Func<TOut, string> identifierMember)
        {
            IEnumerable<KeyValuePair<string, TOut>> output = new Dictionary<string, TOut>();

            // start with all the parent settings in a list.
            if (parentValues != null)
                output = output.Concat(parentValues.ToDictionary(identifierMember.Invoke, x => x));

            // overwrite any parent settings with settings defined in this theme.
            if (themeValues != null)
                output = output.Concat(themeValues.ToDictionary(identifierMember.Invoke, x => x));

            return output.Select(x => x.Value).ToList();
        }

        private static Dictionary<string, ThemeLabelCollection> MergeLabels(Dictionary<string, ThemeLabelCollection> themeValues, Dictionary<string, ThemeLabelCollection> parentValues)
        {
            if (themeValues == null || parentValues == null)
            {
                return themeValues ?? parentValues;
            }
            
            var mergedDictionary = new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase);
            foreach (var localeCode in themeValues.Keys.Concat(parentValues.Keys).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                mergedDictionary[localeCode] = new ThemeLabelCollection();
                if (parentValues.ContainsKey(localeCode))
                {
                    mergedDictionary[localeCode].AddRange(parentValues[localeCode]);
                }
                if (themeValues.ContainsKey(localeCode)) // allow new theme values to overwrite the parent values
                {
                    mergedDictionary[localeCode].AddRange(themeValues[localeCode]);
                }
            }

            return mergedDictionary;
        }
    }
}
