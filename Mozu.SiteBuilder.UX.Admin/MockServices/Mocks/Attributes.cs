using System.Collections.Generic;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices.Mocks
{
    public class UPCAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "UPC";
        public UPCAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "String";
            ValueType = "Admin";
            InputType = "TextBox";
            IsExtra = false;
            IsOption = false;
            IsProperty = true;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "UPC" };
        }
    }

    public class EngravingAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "CustomEngraving";
        public EngravingAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "String";
            ValueType = "Shopper";
            InputType = "TextArea";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Custom Engraving" };
        }
    }

    public class GiftWrapAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "GiftWrapYesNo";
        public GiftWrapAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "Bool";
            InputType = "YesNo";
            ValueType = "Shopper";
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Gift Wrap?" };
        }
    }

    public class UnitCostAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "UnitCost";
        public UnitCostAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "Number";
            InputType = "TextBox";
            ValueType = "Admin";
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Unit Cost" };
        }
    }

    public class ColorAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "Thing-Color";
        public ColorAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            AttributeSequence = 1;
            DataType = "String";
            InputType = "List";
            ValueType = "Admin";
            VocabularyValues = new List<ProductAdmin.Contracts.AttributeVocabularyValue>
                {
                    new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Red" }, Value = "Red", ValueSequence = 1 },
                    new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Green" }, Value = "Green", ValueSequence = 2 },
                    new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Blue" }, Value = "Blue", ValueSequence = 3 },
                    new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Yellow" }, Value = "Yellow", ValueSequence = 4 },
                };
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Color" };
        }
    }

    public class FinishAttribute : DC.Attribute
    {
        public const string ATTRIBUTE_FQN = "BucketFinish";
        public FinishAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            AttributeSequence = 1;
            DataType = "String";
            InputType = "List";
            ValueType = "Admin";
            VocabularyValues = new List<ProductAdmin.Contracts.AttributeVocabularyValue>
                {
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Matte" }, Value = "Matte", ValueSequence = 2 },
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Glossy" }, Value = "Glossy", ValueSequence = 1 },
                };
            IsProperty = false;
            IsExtra = true;
            IsOption = false;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Finish" };
        }
    }
}