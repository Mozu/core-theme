using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;
using NUnit.Framework;
using Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.PriceListHelpers
{
    [TestFixture]
    public class PriceListExtraEntryHelperTest
    {
        [Test]
        public void ShouldHaveValuePopulated()
        {
            //setup
            var prodType = CreateProductType();
            var dcProductExtras = CreateProductExtras();
            var overridenEntries = CreateExistingPriceListEntries();
            var lookup = (overridenEntries.IsNullOrEmpty())
                ? new Dictionary<string, PriceListEntryExtra>()
                : overridenEntries.ToDictionary(x => x.AttributeFQN + "-" + x.Value);


            var sut = new PriceListExtraEntryHelper();

            //execute
            var actual = sut.MergeExtraEntries(
                ((attrFqn, attrValue) => lookup.ContainsKey(attrFqn + "-" + attrValue)
                    ? lookup[attrFqn + "-" + attrValue].OverridePrice
                    : (decimal?)null), 
                dcProductExtras, prodType, overridenEntries);

            //assert
            Assert.That(actual.First(x => x.AttributeFQN.EqualsIgnoreCase("tenant~extra-list-number")).Value, Is.Not.Null, "value should not be null");
        }

        private List<DC.ProductExtra> CreateProductExtras()
        {
            return new List<DC.ProductExtra>
            {
                //new DC.ProductExtra
                //{
                //    AttributeFQN = "tenant~extra-list-text",
                //    Values = new List<DC.ProductExtraValue>
                //    {
                //        CreateProductExtraValue("Platinum", 20.0M, "Platinum", "Platinum"),
                //        CreateProductExtraValue("Gold", 10.0M, "Gold", "Gold"),
                //        CreateProductExtraValue("Silver", 5.0M, "Silver","Silver")
                //    }
                //},
                new DC.ProductExtra
                {
                    AttributeFQN = "tenant~extra-list-number",
                    Values = new List<DC.ProductExtraValue>
                    {
                        CreateProductExtraValue(1, 1.0M),
                        CreateProductExtraValue(2, 2.0M),
                        CreateProductExtraValue(3, 3.0M)
                    }
                }
                //,
                //new DC.ProductExtra
                //{
                //    AttributeFQN = "tenant~extra-list-product",
                //    Values = new List<DC.ProductExtraValue>
                //    {
                //        CreateProductExtraValue("CAP_004-1", 15.0M, "CAP_004-1"),
                //        CreateProductExtraValue("CAP_004-2", 15.0M, "CAP_004-2"),
                //        CreateProductExtraValue("CAP_004-3", 15.0M, "CAP_004-3"),
                //        CreateProductExtraValue("CAP_004-4", 15.0M, "CAP_004-4")
                //    }
                //},

            };
        }


        private static DC.ProductExtraValue CreateProductExtraValue(object value, decimal deltaPrice, object vocabValue=null, string vocabStringValue=null)
        {
            return new DC.ProductExtraValue
            {
                Value =  value,
                DeltaPrice = new DC.ProductExtraValueDeltaPrice
                {
                    CurrencyCode = "USD",
                    DeltaPrice = deltaPrice
                },
                AttributeVocabularyValueDetail = (vocabValue == null) 
                    ? null 
                    : new DC.AttributeVocabularyValue
                    {
                        Value = value,
                        Content = (vocabStringValue == null)
                          ? null
                          : new DC.AttributeVocabularyValueLocalizedContent
                            {
                                LocaleCode = "en-US",
                                StringValue = vocabStringValue
                            }
                    }
            };
        }

        private DC.ProductType CreateProductType()
        {
            return new DC.ProductType
            {
                Extras = new List<DC.AttributeInProductType>
                {
                    //CreateAttributeInProductType("tenant~extra-list-text", "extra-list-text", "Extra - List - Text",
                    //  new [] {"Platinum", "Gold", "Silver"} ),
                    CreateAttributeInProductType("tenant~extra-list-number", "extra-list-number", "Extra-List-Number", 
                      new object[] {1, 2, 3, 4, 5}, false),
                    //CreateAttributeInProductType("tenant~extra-list-product", "extra-list-product", "Extra-List-Product", 
                    //  new [] { "CAP_004-1", "CAP_004-2", "CAP_004-3", "CAP_004-4"}, false)
                }
            };
        }

        private static DC.AttributeInProductType CreateAttributeInProductType(string fqn, string code, string name, object[] values, bool includeContent=true)
        {
            return new DC.AttributeInProductType
            {
                AttributeFQN = fqn,
                AttributeDetail = new DC.Attribute
                {
                    AdminName = name,
                    AttributeCode = code,
                    AttributeFQN = fqn,
                    Content = new DC.AttributeLocalizedContent
                    {
                        LocaleCode = "en-US",
                        Name = name,
                        Description = ""
                    }
                },
                VocabularyValues = values.Select(val => new DC.AttributeVocabularyValueInProductType
                {
                    Value = val,
                    VocabularyValueDetail = new DC.AttributeVocabularyValue
                    {
                        Value = val,
                        Content = includeContent 
                            ? new DC.AttributeVocabularyValueLocalizedContent
                                {
                                    LocaleCode = "en-US",
                                    StringValue = val.ToString()
                                }
                            : null
                    }
                }).ToList()

            };
        }

        private List<PriceListEntryExtra> CreateExistingPriceListEntries()
        {
            return new List<PriceListEntryExtra>
            {
                new PriceListEntryExtra
                {
                    AttributeCode = "extra-list-text",
                    AttributeFQN = "tenant~extra-list-text",
                    DisplayValue = "Platinum",
                    OverridePrice = 19.99M,
                    Value = "Platinum"
                },
                //new PriceListEntryExtra
                //{
                //    AttributeCode = "extra-list-text",
                //    AttributeFQN = "tenant~extra-list-text",
                //    DisplayValue = "Silver",
                //    OverridePrice = 4.99M,
                //    Value = "Silver"
                //},
                //new PriceListEntryExtra
                //{
                //    AttributeCode = "extra-list-product",
                //    AttributeFQN = "tenant~extra-list-product",
                //    DisplayValue = "Hunting Cap - Explicit",
                //    OverridePrice = 14.99M,
                //    Value = "CAP_004-1"
                //}
                //new PriceListEntryExtra
                //{
                //    AttributeCode = "extra-list-number",
                //    AttributeFQN = "tenant~extra-list-number",
                //    DisplayValue = "",
                //    OverridePrice = 1.57M,
                //    Value = "2.0"
                //}
            };

        } 
    }
}
