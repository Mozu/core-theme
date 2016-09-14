using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers
{
    public interface IPriceListExtraEntryHelper
    {
        List<PriceListEntryExtra> MergeExtraEntries(Func<string, string, decimal?> getOverridePrice,
            List<DC.ProductExtra> dcProductExtras, DC.ProductType prodType, List<PriceListEntryExtra> result);
    }

    public class PriceListExtraEntryHelper : IPriceListExtraEntryHelper
    {
        public List<PriceListEntryExtra> MergeExtraEntries(Func<string, string, decimal?> getOverridePrice, 
            List<DC.ProductExtra> dcProductExtras, DC.ProductType prodType, List<PriceListEntryExtra> overrides)
        {
            if (dcProductExtras.IsNullOrEmpty())
            {
                if (overrides.IsNullOrEmpty())
                {
                    return new List<PriceListEntryExtra>();
                }
                dcProductExtras = dcProductExtras ?? new List<DC.ProductExtra>();
            }
            
            var attrLookup = new Dictionary<string, PriceListEntryExtra>();
            foreach (var extra in prodType.Extras)
            {
                if (extra.VocabularyValues.IsNullOrEmpty())
                {
                    attrLookup.Add(extra.AttributeFQN + "-", new PriceListEntryExtra
                    {
                        AttributeFQN = extra.AttributeFQN,
                        AttributeCode = extra.AttributeDetail?.AttributeCode,
                        AttributeName = extra.AttributeDetail?.AdminName,
                        Value = "",
                        DisplayValue = extra.AttributeDetail?.Content?.Name
                    });
                    continue;
                }
                foreach (var vocabValue in extra.VocabularyValues)
                {
                    attrLookup.Add(FormatEntryKey(extra.AttributeFQN, vocabValue.Value), new PriceListEntryExtra
                    {
                        AttributeFQN = extra.AttributeFQN,
                        AttributeCode = extra.AttributeDetail?.AttributeCode,
                        AttributeName = extra.AttributeDetail?.AdminName,
                        Value = ToStringOrEmpty(vocabValue.Value),
                        DisplayValue =
                            (vocabValue.VocabularyValueDetail?.Content != null)
                                ? vocabValue.VocabularyValueDetail.Content.StringValue
                                : ToStringOrEmpty(vocabValue.Value)
                    });
                }
            }

            var extras = dcProductExtras.Where(dc => dc.Values != null)
                                        .Select(extra => extra.Values.Select(x => new PriceListEntryExtra
            {
                AttributeFQN = extra.AttributeFQN,
                AttributeCode = LookupEntryExtra(attrLookup, extra.AttributeFQN, x.Value, ac => ac.AttributeCode),
                AttributeName = LookupEntryExtra(attrLookup, extra.AttributeFQN, x.Value, ac => ac.AttributeName),
                CatalogPrice = x.DeltaPrice?.DeltaPrice,
                OverridePrice = getOverridePrice(extra.AttributeFQN, ToStringOrEmpty(x.Value)),
                DisplayValue = LookupEntryExtra(attrLookup, extra.AttributeFQN, x.Value, ac => ac.DisplayValue),
                Value = ToStringOrEmpty(x.Value)
            }));

            if (overrides == null)
            {
                overrides = new List<PriceListEntryExtra>();
            }

            foreach (var extra in extras)
            {
                overrides.AddRange(extra);
            }
            return overrides;
        }

        private string LookupEntryExtra(Dictionary<string, PriceListEntryExtra> attrLookup, string attributeFqn, object value, Func<PriceListEntryExtra, string> getProperty)
        {
            PriceListEntryExtra entry;
            var key = FormatEntryKey(attributeFqn, value);
            return attrLookup.TryGetValue(key, out entry) 
                ? getProperty(entry) 
                : null;
        }

        private string FormatEntryKey(string attributeFqn, object value)
        {
            return $"{attributeFqn}-{ToStringOrEmpty(value)}";
        }

        private string ToStringOrEmpty(object value)
        {
            return value?.ToString() ?? "";
        }
    }
}