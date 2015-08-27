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
    [TestFixture]
    public class LocalizedProductPropertyMappingTest
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
        public void It_Should_Map_ReportProductPropderty_LocalizedContent_To_JObject(string scenario, string[] locales, string[] values)
        {
            //arrange
            var reportAttribute = ConstructReportProductProperty(locales, values);

            //act
            var actual = Mapper.Map<ReportProductProperty, JObject>(reportAttribute);

            //assert
            for (int i = 0; i < locales.Length; i++)
            {
                Assert.That((string)actual["value_" + locales[i]], Is.EqualTo(values[i]), scenario);
            }

        }
        
        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"Coleur","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttribute_To_LocalizedAttribute(string scenario, string[] locales, string[] names)
        {
            //arrange
            var reportAttribute = ConstructReportProductProperty(locales, names);

            //act
            var jObject = Mapper.Map<ReportProductProperty, JObject>(reportAttribute);
            var actual = jObject.ToObject<LocalizedProductProperty>();

            //assert
            Assert.That(actual.AdminName, Is.EqualTo(reportAttribute.AdminName), scenario);
            Assert.That(actual.AttributeFQN, Is.EqualTo(reportAttribute.AttributeFQN), scenario);
            Assert.That(actual.ProductCode, Is.EqualTo(reportAttribute.ProductCode), scenario);
            Assert.That(actual.ProductName, Is.EqualTo(reportAttribute.ProductName), scenario);
            Assert.That(actual.LocaleCode, Is.EqualTo(reportAttribute.LocaleCode), scenario);
            Assert.That(actual.StringValue, Is.EqualTo(reportAttribute.StringValue), scenario);

            var matched =
                locales.Select(x => reportAttribute.LocalizedValues.Select(y => y.LocaleCode).Contains(x)).ToList();
            Assert.That(matched.Count, Is.EqualTo(locales.Length));

        }

        private static ReportProductProperty ConstructReportProductProperty(string[] locales, string[] names)
        {
            return new ReportProductProperty
            {
                AdminName = "adminName",
                AttributeFQN = "tenant~color",
                ProductName = "nom nom cats",
                ProductCode = "nomNomCat",
                LocaleCode = "en-US",
                StringValue = "Color",
                LocalizedValues = ConstructLocalizedValues(locales, names)
            };
        }

        private static List<ReportAttributeValueLocalizedContent> ConstructLocalizedValues(string[] locales, string[] names)
        {
            return locales.Select((t, i) => new ReportAttributeValueLocalizedContent
            {
                LocaleCode = t, StringValue = names[i], Exists = (!string.IsNullOrEmpty(names[i]))
            }).ToList();
        }

    }
}
