using System;
using System.Collections.Generic;
using System.Linq;
using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
    public class MockRestAttributeRepository : IAttributeRepository
    {
        private static readonly AttributeCollection _attributeCollection;

        static MockRestAttributeRepository()
        {
            _attributeCollection.Items = new List<Attribute.Contracts.Administration.Attribute>();

            for (var i = 1; i < 6; i++)
            {
                _attributeCollection.Items.Add(SetUp(i));
            }
        }

        public Attribute.Contracts.Administration.Attribute Get(object id)
        {
            return _attributeCollection.Items.First(x => x.Id == (int)id);
        }

        public Attribute.Contracts.Administration.Attribute Update(Attribute.Contracts.Administration.Attribute entity)
        {
            var id = _attributeCollection.Items.FindIndex(x => x.Id == entity.Id);
            _attributeCollection.Items[id] = entity;
            return entity;
        }

        public Attribute.Contracts.Administration.Attribute Create(Attribute.Contracts.Administration.Attribute entity)
        {
            _attributeCollection.Items.Add(entity);
            return entity;
        }

        public void Delete(object id)
        {
            var d = _attributeCollection.Items.FindIndex(x => x.Id == (int)id);
            _attributeCollection.Items.RemoveAt(d);
        }

        public AttributeCollection GetAttributes()
        {
            return _attributeCollection;
        }

        private static Attribute.Contracts.Administration.Attribute SetUp(int id)
        {
            return new Attribute.Contracts.Administration.Attribute
            {
                Id = id,
                ProductSetId = 1,
                Content = new AttributeLocalizedContent { Description = "Content description", LocaleCode = "en-US", Name = "Name" },
                DataType = AttributeDataType.String,
                StandardInputTypeIntention = AttributeInputType.Textbox,
                StringValidation = new AttributeValidationString { MinLength = 1, MaxLength = 20, RegularExpression = "someExpression" },
                InternalName = "Attribute " + id,
                LocalizedContent = new List<AttributeLocalizedContent>
                {
                    new AttributeLocalizedContent { Description = "Content description", LocaleCode = "en-US", Name = "Name" },
                    new AttributeLocalizedContent { Description = "El content description", LocaleCode = "es-MX", Name = "Nombre" },
                    new AttributeLocalizedContent { Description = "العربية", LocaleCode = "ar-IQ", Name = "فصل" }
                },
                Values = new List<AttributeValue>
                {
                    new AttributeValue
                    {
                        Id = 1, 
                        Sequence = 1, 
                        StringValue = new AttributeValueString
                        {
                            Content = new AttributeValueStringLocalizedContent
                            {
                                LocaleCode = "en-US", Value = "Some value"
                            }, 
                            InternalValue = "Internal value", 
                            LocalizedContent = new List<AttributeValueStringLocalizedContent>
                            {
                                new AttributeValueStringLocalizedContent
                                {
                                    LocaleCode = "en-US", Value = "Some value"
                                },  
                                new AttributeValueStringLocalizedContent
                                {
                                    LocaleCode = "es-MX", Value = "De nada"
                                },
                                new AttributeValueStringLocalizedContent
                                {
                                    LocaleCode = "ar-IQ", Value = "العربية"
                                },
                            }
                        }
                    }
                }
            };
        }
    }
}
