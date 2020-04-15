using Mozu.SiteBuilder.Mvc.Contexts;
using NSubstitute;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Filters
{
    [Category("Hypr")]
    [TestFixture]
    public class MiscFilterTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private const string currencyTemplate = "{{ price | currency }}";

        private static List<TestDescriptor> GetTests()
        {

            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "GBP -2",
                    Template = currencyTemplate,
                    Context = new Dictionary<string, object> { { "price", 1254.567 } },
                    ContainerModifier= cb =>
                    {

                        var pc = Substitute.For<IPageContext>();
                        cb.AddScoped((c)=>pc);
                        pc.NumberFormat.Returns(
                            new System.Globalization.NumberFormatInfo()
                            {
                                  CurrencyDecimalDigits =2,
                                CurrencySymbol = "£"
                            });


                        pc.CurrencyRateInfo.Returns( new CurrencyRateInfo()
                        {
                            Rate=(decimal)1.333,
                            Rounding =-2
                        });



                    },
                    ExpectedFunc = TestDescriptor.CompareLiteral("£1,700.00")
                },
                new TestDescriptor
                {
                    Name = "GBP 1",
                    Template = currencyTemplate,
                    Context = new Dictionary<string, object> { { "price", 1254.567 } },
                    ContainerModifier= cb =>
                    {

                        var pc = Substitute.For<IPageContext>();
                        cb.AddScoped((c)=>pc);
                        pc.NumberFormat.Returns(
                            new System.Globalization.NumberFormatInfo()
                            {
                                  CurrencyDecimalDigits =2,
                                CurrencySymbol = "£"
                            });
                        pc.CurrencyRateInfo.Returns( new CurrencyRateInfo()
                        {
                            Rate=(decimal)1,
                            Rounding =1
                        });


                    },
                    ExpectedFunc = TestDescriptor.CompareLiteral("£1,254.60")
                }
            };
        }
    }
}
