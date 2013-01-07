// -----------------------------------------------------------------------
// <copyright file="IDocumentRepository.cs" company="Microsoft">
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


    public interface IDocumentRepository 
    {
        Document Get(string collection, string id);
        Document GetByPath(string collection, string path);
        Document Update(string collection, Document entity);
        Document Create(string collection, Document entity);
        void Delete(string collection, Document entity);
    }

    public class DocumentRepository:IDocumentRepository
    {
        static List<Document> g_docs = new List<Document>(){
                new Document()
                {
                    Id = "bing",
                    Name = "steve.htm",
                    DocumentType = "blog",
                    Properties = new List< PropertyData>()
                    {
                    
                        new  PropertyData ()
                        {
                            DisplayName ="Layout",
                            Name="Layout",
                            LocalName = "Layout",
                            PropertyType=  PropertyValueType.String ,
                            Value = "OneColumn"
                        
                        },
                        new  PropertyData ()
                        {
                            DisplayName ="Title",
                            Name="Title",
                            LocalName = "Title",
                            PropertyType=  PropertyValueType.String ,
                            Value = "I am the title"
                        },
                        new  PropertyData ()
                        {
                            DisplayName ="Body",
                            Name="Body",
                            LocalName = "Body",
                            PropertyType=  PropertyValueType.String ,
                            Value = "<div>I am the <b>Body</b><br /><img src='http://www.roflzoo.com/pics/062010/cats-in-sink.jpg' /></div>"
                        }
                   

                    }
                },
                new Document()
                {
                    Id = "bong",
                    Name = "suzan.htm",
                    DocumentType = "page",
                    Properties = new List< PropertyData>()
                    {
                    
                        new  PropertyData ()
                        {
                            DisplayName ="Layout",
                            Name="Layout",
                            LocalName = "Layout",
                            PropertyType=  PropertyValueType.String ,
                            Value = "OneColumn"
                        
                        },
                        new  PropertyData ()
                        {
                            DisplayName ="Title",
                            Name="Title",
                            LocalName = "Title",
                            PropertyType=  PropertyValueType.String ,
                            Value = "I am the title"
                        },
                        new  PropertyData ()
                        {
                            DisplayName ="Body",
                            Name="Body",
                            LocalName = "Body",
                            PropertyType=  PropertyValueType.String ,
                            Value = "<div>I am the <b>Body</b></div>"
                        }
                   

                    }
                }
        };


        public Document Get(string collection, string id)
        {
            return g_docs.FirstOrDefault(x => x.Id == id);
            
        }

        public Document Update(string collection, Document entity)
        {
            var doc = Get(collection, entity.Id);
            foreach (var prop in entity.Properties)
            {
                var sourceProp = doc.Properties.FirstOrDefault (x => x.Name == prop.Name);
                if (sourceProp == null)
                {
                    sourceProp = prop;
                    doc.Properties.Add(prop);
                }
                sourceProp.Value = prop.Value;
            }

            return doc;
        }

        public Document Create(string collection, Document entity)
        {
            g_docs.Add(entity);
            return entity;
        }

        public void Delete(string collection, Document entity)
        {
            var idx = g_docs.FindIndex(x => x.Id == entity.Id);
            g_docs.RemoveAt(idx);
        }


        public Document GetByPath(string collection, string path)
        {
            return g_docs.FirstOrDefault(x => x.Name == path);
            
        }
    }
  
}

