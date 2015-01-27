using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Localization
{
    [Category("Mapping")]
    [TestFixture]
    public class LocalizedAttributeMappingTest
    {
        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.AddProfile<LocalizationMapping>();
        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"Coleur","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttribute_LocalizedContent_To_JObject(string scenario, string[] locales, string[] names)
        {
            //arrange
            var reportAttribute = ConstructReportAttribute(locales, names);

            //act
            var actual = Mapper.Map<ReportAttribute, JObject>(reportAttribute);

            //assert
            for (int i = 0; i < locales.Length; i++)
            {
                Assert.That((string)actual["name_" + locales[i]], Is.EqualTo(names[i]), scenario);
            }

        }
        
        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"Coleur","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttribute_To_LocalizedAttribute(string scenario, string[] locales, string[] names)
        {
            //arrange
            var reportAttribute = ConstructReportAttribute(locales, names);

            //act
            var jObject = Mapper.Map<ReportAttribute, JObject>(reportAttribute);
            var actual = jObject.ToObject<LocalizedAttribute>();

            //assert
            Assert.That(actual.AdminName, Is.EqualTo(reportAttribute.AdminName), scenario);
            Assert.That(actual.AttributeFQN, Is.EqualTo(reportAttribute.AttributeFQN), scenario);
            Assert.That(actual.Description, Is.EqualTo(reportAttribute.Description), scenario);
            Assert.That(actual.LocaleCode, Is.EqualTo(reportAttribute.LocaleCode), scenario);
            Assert.That(actual.Name, Is.EqualTo(reportAttribute.Name), scenario);

            var matched =
                locales.Select(x => reportAttribute.LocalizedValues.Select(y => y.LocaleCode).Contains(x)).ToList();
            Assert.That(matched.Count, Is.EqualTo(locales.Length));

        }

        private static ReportAttribute ConstructReportAttribute(string[] locales, string[] names)
        {
            return new ReportAttribute
            {
                AdminName = "adminName",
                AttributeFQN = "tenant~color",
                Description = null,
                LocaleCode = "en-US",
                Name = "Color",
                LocalizedValues = ConstructLocalizedValues(locales, names)
            };
        }

        private static List<ReportAttributeLocalizedContent> ConstructLocalizedValues(string[] locales, string[] names)
        {
            return locales.Select((t, i) => new ReportAttributeLocalizedContent
            {
                LocaleCode = t, Name = names[i], Exists = (!string.IsNullOrEmpty(names[i]))
            }).ToList();
        }

    }
}
