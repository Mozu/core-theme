using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
    public static class ThemeFactory 
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
                Hash = tmd.Hash,
                Parent = parent,
                DefaultLanguage = DefaultThemeLanguage,
                MergedLabels = tmd.Labels ?? new Dictionary<string, ThemeLabelCollection>(StringComparer.OrdinalIgnoreCase){{DefaultThemeLanguage, new ThemeLabelCollection()}}, // assign default labels collection
                FileListing = tmd.FileListing
            };

            if (parent != null)
            {
                theme.MergedLabels = MergeLabels(tmd.Labels, parent.MergedLabels);
                theme.TimeStamp = !parent.IsCoreTheme  && parent.TimeStamp  > theme.TimeStamp ? parent.TimeStamp : theme.TimeStamp;
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
                    theme.Settings = tmd.Configuration.Settings;
                    theme.PageTypes = tmd.Configuration.PageTypes;
                    theme.EmailTemplates = tmd.Configuration.EmailTemplates;
                    theme.MobileNotificationTemplates = tmd.Configuration.MobileNotificationTemplates;
                    theme.BackOfficeTemplates = tmd.Configuration.BackOfficeTemplates;
                    theme.Widgets = tmd.Configuration.Widgets;
                    theme.Editors = tmd.Configuration.Editors;
                    theme.Layouts = tmd.Configuration.Layouts;
                }
                else
                {
                    theme.Settings = Merge(tmd.Configuration.Settings, parent.Settings, StringComparer.OrdinalIgnoreCase);
                    theme.PageTypes = Merge(tmd.Configuration.PageTypes, parent.PageTypes, pt => pt.Id).ToList();
                    theme.EmailTemplates = Merge(tmd.Configuration.EmailTemplates, parent.EmailTemplates, pt => pt.Id).ToList();
                    theme.MobileNotificationTemplates = Merge(tmd.Configuration.MobileNotificationTemplates, parent.MobileNotificationTemplates, pt => pt.Id).ToList();
                    theme.BackOfficeTemplates = Merge(tmd.Configuration.BackOfficeTemplates, parent.BackOfficeTemplates, pt => pt.Id).ToList();
                    theme.Editors = Merge(tmd.Configuration.Editors, parent.Editors, pt => pt.Id).ToList();
                    theme.Widgets = Merge(tmd.Configuration.Widgets, parent.Widgets, widget => widget.Id).ToList();
                    theme.Layouts = Merge(tmd.Configuration.Layouts, parent.Layouts, layout => layout.Id).ToList(); 
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

        /// <summary>
        /// Ugh, we can't assume that the values posted in are actually any good, so here we have to ensure uniqueness according to the identifier member passed in
        /// </summary>
        /// <returns></returns>
        private static IEnumerable<T> EnsureUniqueness<T>(IEnumerable<T> values, Func<T, string> identifierMember)
        {
            return (values ?? Enumerable.Empty<T>()).GroupBy(identifierMember).Select(x => x.First());
        } 

        private static IEnumerable<TOut> Merge<TOut>(IEnumerable<TOut> themeValues, IEnumerable<TOut> parentValues, Func<TOut, string> identifierMember)
        {
            var p = EnsureUniqueness(parentValues, identifierMember).ToDictionary(identifierMember.Invoke, x => x, StringComparer.OrdinalIgnoreCase);
            var t = EnsureUniqueness(themeValues, identifierMember).ToDictionary(identifierMember.Invoke, x => x, StringComparer.OrdinalIgnoreCase);

            var output = MergeValuesPreferChild(p, t, StringComparer.OrdinalIgnoreCase);
            return output.Select(x => x.Value);
        }
        private static Dictionary<TKey, Tvalue> Merge<TKey, Tvalue>(IDictionary<TKey, Tvalue> themeValues, IDictionary<TKey, Tvalue> parentValues, IEqualityComparer<TKey> comparer)
        {
            var dic = new Dictionary<TKey, Tvalue>(Math.Max(themeValues.Count, parentValues.Count), comparer);
            dic.AddRange(parentValues);
            foreach( var kvp in themeValues)
            {
                dic[kvp.Key] = kvp.Value;
            }
            return dic;


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
                
                var p = parentValues.ContainsKey(localeCode) ? parentValues[localeCode] : new ThemeLabelCollection();
                var c = themeValues.ContainsKey(localeCode) ? themeValues[localeCode] : new ThemeLabelCollection();
                var coll = new ThemeLabelCollection();
                coll.AddRange(Merge(c, p, x => x.Key));
                mergedDictionary[localeCode] = coll;
            }

            return mergedDictionary;
        }

        private static IEnumerable<KeyValuePair<TKey,TValue>> MergeValuesPreferChild<TKey, TValue>(Dictionary<TKey, TValue> parentThemeValues, Dictionary<TKey, TValue> childThemeValues, IEqualityComparer<TKey> comparer)
        {
            var uniqueValues =  childThemeValues.Concat(parentThemeValues.Where(x => !childThemeValues.Keys.Contains(x.Key, comparer)));
            return uniqueValues;
        }
    }
}
