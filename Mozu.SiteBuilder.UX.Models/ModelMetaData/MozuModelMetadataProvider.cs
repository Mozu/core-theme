using System;
using System.Collections.Generic;
using System.Linq;


namespace Mozu.SiteBuilder.UX.Models.ModelMetaData
{
    

    public delegate IEnumerable<Dictionary<string, object>> GetMetadataForPropertiesHandler(object container, Type containerType);

    public interface IModelMetadataContainer
    {
        Dictionary<string, object> GetModelMetadata();
    }

    public interface IModelMetadataParentContainer
    {
        Dictionary<string, object> GetModelMetadata(string property);
    }

    public interface IModelMetadataAncestorDependantItem
    {
        Dictionary<string, object> GetModelMetadata(IList<Object> ancestors);
    }

  

    public abstract class MetadataProcessorAttribute : Attribute
    {
        /// <summary>
        /// Method for processing custom attribute data.
        /// </summary>
        /// <param name="modelMetaData">A ModelMetaData instance.</param>
        public abstract void Process(Dictionary<string, object> modelMetaData);
    }

    public class PropertyNameAttribute : Attribute
    {
        public  PropertyNameAttribute(string propertyName)
        {
            PropertyName = propertyName;
        }

        public string PropertyName
        {
            get;
            set;
        }
    }
}