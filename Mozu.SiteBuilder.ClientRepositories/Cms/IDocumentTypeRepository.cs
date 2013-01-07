// -----------------------------------------------------------------------
// <copyright file="IDocumentTypeRepository.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Volusion.SiteBuilder.ClientRepositories.Cms
{
   using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Volusion.ContentService.Contracts;


    public interface IDocumentTypeRepository : IRepository<DocumentType>
    {
  
    }
    public class DocumentTypeRepository:IDocumentTypeRepository
    {

        static List< DocumentType> g_doc_Types = new List< DocumentType>()
            {
                new  DocumentType()
                {
                     Name = "blog",
                    PropertyDefintions = new List< PropertyType>()
                        {
                            new  PropertyType ()
                            {
                                Name="Layout",
                                PropertyValueType = "String" ,
                                PropertyValueStorageType = PropertyValueType.String 
                            },
                            new  PropertyType ()
                            {
                                Name="Title",
                                PropertyValueType = "String" ,
                                PropertyValueStorageType = PropertyValueType.String 
                            },
                            new  PropertyType ()
                            {
                                Name="Body",
                                PropertyValueType = "Html",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                            ,
                            new  PropertyType ()
                            {
                                Name="Content2",
                                PropertyValueType = "Html",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                            ,
                    
                            new  PropertyType ()
                            {
                                Name="Image",
                                PropertyValueType = "Image",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                            ,
                    
                            new  PropertyType ()
                            {
                                Name="Tags",
                                PropertyValueType = "Tags",
                                PropertyValueStorageType = PropertyValueType.StringMulti  
                            }
                        }
                },
                new  DocumentType()
                {
                    Name = "page",
                    PropertyDefintions = new List< PropertyType>()
                        {
                            new  PropertyType ()
                            {
                                Name="Layout",
                                PropertyValueType = "String" ,
                                PropertyValueStorageType = PropertyValueType.String 
                            },
                            new  PropertyType ()
                            {
                                Name="Title",
                                PropertyValueType = "String" ,
                                PropertyValueStorageType = PropertyValueType.String 
                            },
                            new  PropertyType ()
                            {
                                Name="Body",
                                PropertyValueType = "Html",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                            ,
                            new  PropertyType ()
                            {
                                Name="Content2",
                                PropertyValueType = "Html",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                            ,
                    
                            new  PropertyType ()
                            {
                                Name="Image",
                                PropertyValueType = "Image",
                                PropertyValueStorageType = PropertyValueType.String 
                            }
                        }
                }
            };
        public DocumentType Get(object id)
        {
            return g_doc_Types.First(x => x.Name == (string)id);
        }

        public DocumentType Update(DocumentType entity)
        {
            throw new NotImplementedException();
        }

        public DocumentType Create(DocumentType entity)
        {
            throw new NotImplementedException();
        }

        public void Delete(object id)
        {
            throw new NotImplementedException();
        }
    }
}
