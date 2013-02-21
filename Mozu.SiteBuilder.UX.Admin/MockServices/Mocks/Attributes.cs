using System.Collections.Generic;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices.Mocks
{
    public class UPCAttribute : DC.Attribute
    {
        public UPCAttribute()
        {
            AttributeFQN = "UPC";
            DataType = "String";
            ValueType = "Admin";
            InputType = "TextBox";
            IsExtra = false;
            IsOption = false;
            IsProperty = true;
        }
    }

    public class EngravingAttribute : DC.Attribute
    {
        public EngravingAttribute()
        {
            AttributeFQN = "CustomEngraving";
            DataType = "String";
            ValueType = "Shopper";
            InputType = "TextArea";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
        }
    }

    public class GiftWrapAttribute : DC.Attribute
    {
        public GiftWrapAttribute()
        {
            AttributeFQN = "GiftWrapYesNo";
            DataType = "Bool";
            InputType = "YesNo";
            ValueType = "Shopper";
        }
    }

    public class UnitCostAttribute : DC.Attribute
    {
        public UnitCostAttribute()
        {
            AttributeFQN = "UnitCost";
            DataType = "Number";
            InputType = "TextBox";
            ValueType = "Admin";
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
        }
    }

    public class ColorAttribute : DC.Attribute
    {
        public ColorAttribute()
        {
            AttributeFQN = "Thing-Color";
            AttributeSequence = 1;
            DataType = "String";
            InputType = "List";
            ValueType = "Admin";
            VocabularyValues = new List<ProductAdmin.Contracts.AttributeVocabularyValue>
                {
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Red" }, Value = "Red", ValueSequence = 1 },
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Green" }, Value = "Green", ValueSequence = 2 },
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Blue" }, Value = "Blue", ValueSequence = 3 },
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Yellow" }, Value = "Yellow", ValueSequence = 4 },
                };
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
        }
    }

    public class FinishAttribute : DC.Attribute
    {
        public FinishAttribute()
        {
            AttributeFQN = "BucketFinish";
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
        }
    }
}