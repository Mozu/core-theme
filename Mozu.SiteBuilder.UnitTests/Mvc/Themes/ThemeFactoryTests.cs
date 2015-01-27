using System.Collections.Generic;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Themes
{
    [Category("Hypr")]
    [TestFixture]
    public class ThemeFactoryTests
    {
        const string defaultLang = "en-US";
        const string newLang = "es-MX";
        const string testLabelKey = "key";
        const string testValue = " value";

        [Test]
        public void SimpleMergeIsOk()
        {
            var themeMeta = new ThemeMetaData
            {
                Labels = new Dictionary<string, ThemeLabelCollection>
                {
                    {defaultLang, new ThemeLabelCollection{{testLabelKey, testValue}}},
                    {newLang, new ThemeLabelCollection{{"newKey", "newValue"}}},
                },
            };

            var result = ThemeFactory.Build(themeMeta, null);
            Assert.IsTrue(result.MergedLabels[newLang].Count.Equals(2)); // should have the default key as well as the new key
        }

        [Test]
        public void ParentLabelsAreAdded()
        {
            var themeMeta = new ThemeMetaData
            {
                Labels = new Dictionary<string, ThemeLabelCollection>
                {
                    {defaultLang, new ThemeLabelCollection{{testLabelKey, testValue}}},
                    {newLang, new ThemeLabelCollection()},
                },
            };

            var parent = new Theme
            {
                MergedLabels = new Dictionary<string, ThemeLabelCollection>
                {
                    {newLang, new ThemeLabelCollection {{"newKey", "newValue"}}}
                }
            };

            var result = ThemeFactory.Build(themeMeta, parent);
            Assert.IsTrue(result.MergedLabels[newLang].Count.Equals(2)); // should have the default key as well as the new key
        }

        [Test]
        public void ThemeLabelsOverrideParentLabels()
        {
            // establish a theme with labels for two langugages. The non-default language should overwrite our 'default key'
            var themeMeta = new ThemeMetaData
            {
                Labels = new Dictionary<string, ThemeLabelCollection>
                {
                    {defaultLang, new ThemeLabelCollection{{testLabelKey, testValue}}},
                    {newLang, new ThemeLabelCollection()}
                },
            };

            var newvalue = "newValue";
            var parent = new Theme
            {
                MergedLabels = new Dictionary<string, ThemeLabelCollection>
                {
                    {newLang, new ThemeLabelCollection {{testLabelKey, newvalue}}}
                }
            };

            var result = ThemeFactory.Build(themeMeta, parent);
            Assert.IsTrue(result.MergedLabels[newLang][testLabelKey].EqualsIgnoreCase(newvalue));
        }

        [Test]
        public void LabelsInLanguageNotDefaultAreSetToDefaultIfNotProvided()
        {
            // establish a theme with labels for two langugages. The non-default language should not have our 'default key'
            var themeMeta = new ThemeMetaData
            {
                Labels = new Dictionary<string, ThemeLabelCollection>
                {
                    {defaultLang, new ThemeLabelCollection{{testLabelKey, testValue}}},
                    {newLang, new ThemeLabelCollection()}
                },
            };

            var result = ThemeFactory.Build(themeMeta, null);
            Assert.IsTrue(result.MergedLabels[newLang][testLabelKey].EqualsIgnoreCase(result.MergedLabels[defaultLang][testLabelKey]));
        }
    }
}
