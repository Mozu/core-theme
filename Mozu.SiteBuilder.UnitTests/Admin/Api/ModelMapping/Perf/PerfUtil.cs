using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Perf
{
    public class PerfUtil
    {
        public static int MaxTimes = 2; //1000000 ****never check in, only 2 so doesn't drag unit tests.

        public static void WriteSummary(int max, Stopwatch st)
        {
            Console.WriteLine("{0:0,000} times", max);
            Console.WriteLine("{0:0,000} ticks", st.ElapsedTicks);
            Console.WriteLine("{0} ms", st.ElapsedMilliseconds);
        }

        public static ProductAdmin.Contracts.Product CreateDomainProduct()
        {
            return new ProductAdmin.Contracts.Product()
            {
                ApplicableDiscounts = CreateApplicableDiscounts(),
                BaseProductCode = "xyz",
                AuditInfo = new AuditInfo(),
                Content = CreateLocalizedContent(),
                Extras = CreateProductExtras(),
                HasConfigurableOptions = true,
                HasStandAloneOptions = false,
                InventoryInfo = CreateProductInventoryInfo()
            };
        }

        private static ProductInventoryInfo CreateProductInventoryInfo()
        {
            return new ProductInventoryInfo()
            {
                ManageStock = true,
                OutOfStockBehavior = "Deactivate"
            };
        }

        private static List<ProductExtra> CreateProductExtras()
        {
            return new List<ProductExtra>()
            {
                new ProductExtra()
                {
                    AttributeFQN = "Custom.ATTR_SKIRT_LENGTH",
                    IsMultiSelect = false,
                    IsRequired = true,
                    Values = new List<ProductExtraValue>()
                    {
                        CreateProductExtraValue("Long"),
                        CreateProductExtraValue("Medium"),
                        CreateProductExtraValue("Short"),
                        CreateProductExtraValue("Hot Cop"),
                        CreateProductExtraValue("Kevin Wright Length"),

                    }
                }
            };
        }

        private static ProductExtraValue CreateProductExtraValue(string contentValue)
        {
            return new ProductExtraValue()
            {
                AttributeVocabularyValueDetail = new AttributeVocabularyValue()
                {
                    Content = new AttributeVocabularyValueLocalizedContent()
                    {
                        LocaleCode = "en-US",
                        StringValue = contentValue
                    }
                }
            };
        }

        private static ProductLocalizedContent CreateLocalizedContent()
        {
            return new ProductLocalizedContent()
            {
                LocaleCode = "en-US",
                ProductFullDescription = "Fancy Dancy Flirty Skirty!",
                ProductName = "Yoga Skirt"
            };
        }

        private static List<Discount> CreateApplicableDiscounts()
        {
            return new List<Discount>()
            {
                new Discount()
                {
                    Amount = .1M, Conditions = new DiscountCondition()
                    {
                        MinimumOrderAmount = 100M
                    }
                }
            };
        }

        public static Stopwatch ExecuteTimeMapping(ProductAdmin.Contracts.Product domainProduct)
        {
            var primingPumpProduct = Mapper.Map<Product>(domainProduct);
            var st = new Stopwatch();
            st.Start();
            for (int i = 0; i < MaxTimes; i++)
            {
                var product = Mapper.Map<Product>(domainProduct);
                product = null;
            }
            st.Stop();
            return st;
        }

        public const int MAX_ATTRIBUTE_VALUE_LENGTH = 50;
    }
}