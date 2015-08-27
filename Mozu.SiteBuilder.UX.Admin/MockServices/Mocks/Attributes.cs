using System;
using System.Collections.Generic;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices.Mocks
{
    public abstract class BaseMockAttribute : DC.Attribute
    {
        protected BaseMockAttribute()
        {
            Validation = new DC.AttributeValidation();
        }
    }

    #region AdminEntered attributes
    /// <summary>
    /// An AdminEntered-Textarea-String attribute.
    /// </summary>
    public class EngravedPoem : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "EngravedPoem";
        public EngravedPoem()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "String";
            ValueType = "Admin";
            InputType = "TextArea";
            IsExtra = false;
            IsOption = false;
            IsProperty = true;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { 
                LocaleCode = "en-US",
                Name = "Engraved Poem" };
        }
    }

    /// <summary>
    /// An AdminEntered-TextBox-String attribute.
    /// </summary>
    public class UPCAttribute : BaseMockAttribute
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
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "UPC" };
        }
    }

    /// <summary>
    /// An AdminEntered-TextBox-Number attribute.
    /// </summary>
    public class UnitCostAttribute : BaseMockAttribute
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
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Unit Cost" };
        }
    }

    /// <summary>
    /// An AdminEntered-YesNo-Bool attribute.
    /// </summary>
    public class SmashedToPiecesAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "SmashedToPieces";
        public SmashedToPiecesAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "Bool";
            InputType = "YesNo";
            ValueType = "Admin";
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Do you want this product smashed to pieces before it arrives?" };
        }
    }

    /// <summary>
    /// An AdminEntered-Date-DateTime attribute.
    /// </summary>
    public class NewYearsEditionAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "NewYearsEdition";
        public NewYearsEditionAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "DateTime";
            InputType = "Date";
            ValueType = "Admin";
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "What date do you want this for." };
        }
    }

    /// <summary>
    /// An AdminEntered-DateTime-DateTime attribute.
    /// </summary>
    public class AppointmentKeeperAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "AppointmentKeeper";
        public AppointmentKeeperAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "DateTime";
            InputType = "DateTime";
            ValueType = "Admin";
            IsProperty = true;
            IsExtra = false;
            IsOption = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Choose a date and time for this thing." };
        }
    }

    #endregion

    #region ShopperEntered attributes
    /// <summary>
    /// A ShopperEntered-TextArea-String attribute.
    /// </summary>
    public class EngravingParagraphAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "CustomEngravingParagraph";
        public EngravingParagraphAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "String";
            ValueType = "Shopper";
            InputType = "TextArea";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Custom Engraving Paragraph" };
        }
    }

    /// <summary>
    /// A ShopperEntered-TextBox-String attribute.
    /// </summary>
    public class EngravingAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "CustomEngravingParagraph";
        public EngravingAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "String";
            ValueType = "Shopper";
            InputType = "TextBox";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Custom Engraving Paragraph" };
        }
    }

    /// <summary>
    /// A ShopperEntered-TextBox-Number attribute.
    /// </summary>
    public class NumberOfMissingScrewsAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "NumberOfMissingScrews";
        public NumberOfMissingScrewsAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "Number";
            ValueType = "Shopper";
            InputType = "TextBox";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "How many screws should we leave out of the box?" };
        }
    }

    /// <summary>
    /// A ShopperEntered-YesNo-Bool attribute.
    /// </summary>
    public class GiftWrapAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "GiftWrapYesNo";
        public GiftWrapAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "Bool";
            ValueType = "Shopper";
            InputType = "YesNo";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Gift Wrap?" };
        }
    }

    /// <summary>
    /// A ShopperEntered-Date-DateTime attribute.
    /// </summary>
    public class ShopperDateAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "ShopperDate";
        public ShopperDateAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "DateTime";
            ValueType = "Shopper";
            InputType = "Date";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "I'm so tired of thinking up names." };
        }
    }


    /// <summary>
    /// A ShopperEntered-DateTime-DateTime attribute.
    /// </summary>
    public class ShopperDateTimeAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "ShopperDateTime";
        public ShopperDateTimeAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            DataType = "DateTime";
            ValueType = "Shopper";
            InputType = "DateTime";
            IsExtra = true;
            IsOption = false;
            IsProperty = false;
            VocabularyValues = new List<DC.AttributeVocabularyValue>();
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Ug a datetime." };
        }
    }
    #endregion

    #region Predefined attributes
    /// <summary>
    /// A Predefined-List-String attribute.
    /// </summary>
    public class ColorAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "Thing-Color";
        public ColorAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            AttributeSequence = 1;
            DataType = "String";
            InputType = "List";
            ValueType = "Predefined";
            VocabularyValues = new List<DC.AttributeVocabularyValue> {
                new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Red" }, Value = "Red", ValueSequence = 1 },
                new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Green" }, Value = "Green", ValueSequence = 2 },
                new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Blue" }, Value = "Blue", ValueSequence = 3 },
                new DC.AttributeVocabularyValue { Content = new DC.AttributeVocabularyValueLocalizedContent { StringValue = "Yellow" }, Value = "Yellow", ValueSequence = 4 },
            };
            IsProperty = true;
            IsExtra = true;
            IsOption = true;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Color" };
        }
    }

    /// <summary>
    /// A Predefined-List-String attribute.
    /// </summary>
    public class FinishAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "BucketFinish";
        public FinishAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            AttributeSequence = 1;
            DataType = "String";
            InputType = "List";
            ValueType = "Predefined";
            VocabularyValues = new List<ProductAdmin.Contracts.AttributeVocabularyValue>
                {
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Matte" }, Value = "Matte", ValueSequence = 2 },
                    new ProductAdmin.Contracts.AttributeVocabularyValue { Content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent { StringValue = "Glossy" }, Value = "Glossy", ValueSequence = 1 },
                };
            IsProperty = true;
            IsExtra = true;
            IsOption = true;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Finish" };
        }
    }

    /// <summary>
    /// A Predefined-List-Number attribute.
    /// </summary>
    public class NumberOfWheelsAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "NumberOfWheels";
        public NumberOfWheelsAttribute()
        {
            AttributeFQN = ATTRIBUTE_FQN;
            AttributeSequence = 1;
            DataType = "Number";
            InputType = "List";
            ValueType = "Predefined";
            VocabularyValues = new List<DC.AttributeVocabularyValue> {
                new DC.AttributeVocabularyValue { Value = 2, ValueSequence = 1 },
                new DC.AttributeVocabularyValue { Value = 3, ValueSequence = 2 },
                new DC.AttributeVocabularyValue { Value = 17, ValueSequence = 3 },
            };
            IsProperty = true;
            IsExtra = true;
            IsOption = true;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Number of Wheels" };
        }
    }

    /// <summary>
    /// A Predefined-List-Date attribute.
    /// </summary>
    public class LastTimeYouPaidTaxesAttribute : BaseMockAttribute
    {
        public const string ATTRIBUTE_FQN = "LastTimeYouPaidTaxes";
        public LastTimeYouPaidTaxesAttribute()
        {
            AttributeFQN = AttributeFQN;
            AttributeSequence = 1;
            DataType = "DateTime";
            InputType = "List";
            ValueType = "Predefined";
            VocabularyValues = new List<DC.AttributeVocabularyValue> {
                new DC.AttributeVocabularyValue { Value = new DateTime(2011, 12, 31), ValueSequence = 1 },
                new DC.AttributeVocabularyValue { Value = new DateTime(2010, 12, 31), ValueSequence = 1 },
                new DC.AttributeVocabularyValue { Value = new DateTime(2009, 12, 31), ValueSequence = 1 },
                new DC.AttributeVocabularyValue { Value = new DateTime(1972, 12, 31), ValueSequence = 1 }
            };
            IsProperty = true;
            IsExtra = true;
            IsOption = true;
            Content = new DC.AttributeLocalizedContent { LocaleCode = "en-US", Name = "Last Time You Paid Taxes" };
        }
    }
    #endregion
}