using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
    /// <summary>
    /// Factory to build a merged configuration object from a themes inheritance chain.
    /// </summary>
    internal class ThemeConfigurationFactory
    {
        /// <summary>
        /// Figures out a <code>Theme</code>'s configuration by walking its inheritance tree and merging all the settings.
        /// </summary>
        public List<ThemeConfigurationItem> GetMergedConfigurations(Theme theme)
        {
            IEnumerable<IEnumerable<ThemeConfigurationItem>> configurationStack =
                from t in theme.StackT.Cast<Theme>().Reverse()
                where t.NodeConfiguration != null
                select t.NodeConfiguration;

            return MergeConfigurations(configurationStack);
        }

        private static List<ThemeConfigurationItem> MergeConfigurations(IEnumerable<IEnumerable<ThemeConfigurationItem>> configs)
        {
            if (configs == null || configs.Count() == 0)
                return null;

            var dic = configs.First().Where(item => item.Id != null).ToDictionary(item => item.Id);
            var allVals = dic.Values.Flatten(x => x.Items);
            foreach (var overrideConfig in configs.Skip(1))
            {
                foreach (var item in overrideConfig)
                {
                    var id = item.Id ?? item.Text ?? Guid.NewGuid().ToString();
                    if (!dic.ContainsKey(id))
                    {
                        dic.Add(id, item);
                    }
                    else
                    {
                        dic[id] = MergeItem(dic[id], item);
                    }
                }
            }

            List<ThemeConfigurationItem> badItems = new List<ThemeConfigurationItem>();
            foreach (var overrideConfig in configs.Skip(1).Reverse())
            {
                var configVals = overrideConfig.Flatten(x => x.Items);

                foreach (var configItem in configVals)
                {
                    foreach (var val in allVals.Where(x => x.Id == configItem.Id && x != configItem))
                    {
                        badItems.Add(val);
                    }
                }
            }
            return dic.Values.ToList();
        }

        private static ThemeConfigurationItem MergeItem(ThemeConfigurationItem destination, ThemeConfigurationItem source)
        {
            // Set top level properites
            destination.DefaultValue = source.DefaultValue;
            destination.Mode = source.Mode;
            destination.Text = source.Text;
            destination.ItemType = source.ItemType;
            destination.Values = source.Values;
            destination.Visible = source.Visible;

            // If CLEAR, set all of this item's child items to visible = false except when the source item's are present
            if (source.Inherit == Constants.Clear)
            {
                destination.Items.Clear();
            }

            // Add the destination children to the dictionary
            var dic = new Dictionary<string, ThemeConfigurationItem>();

            if (destination.Items != null)
            {
                dic = destination.Items.ToDictionary(item => item.Id);
            }

            if (source.Items != null)
            {
                foreach (var item in source.Items)
                {
                    if (!dic.ContainsKey(item.Id))
                    {
                        dic.Add(item.Id, item);
                    }
                    else
                    {
                        dic[item.Id] = MergeItem(dic[item.Id], item);
                    }
                }
            }

            destination.Items = dic.Values.ToList();

            return destination;
        }
    }
}
