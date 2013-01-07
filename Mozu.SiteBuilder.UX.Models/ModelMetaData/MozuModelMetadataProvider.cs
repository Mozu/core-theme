using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Models.ModelMetaData
{
    public class MozuModelMetadataProvider : DataAnnotationsModelMetadataProvider
    {
        protected override ModelMetadata CreateMetadata(IEnumerable<Attribute> attributes, Type containerType, Func<object> modelAccessor, Type modelType, string propertyName)
        {
            propertyName = attributes.OfType<PropertyNameAttribute>().Select(x => x.PropertyName).FirstOrDefault() ?? propertyName;
            var modelMetadata = base.CreateMetadata(attributes, containerType, modelAccessor, modelType, propertyName);
            
            attributes.OfType<MetadataProcessorAttribute>().ToList().ForEach(x => x.Process(modelMetadata));
            return modelMetadata;
        }
       
        public override IEnumerable<ModelMetadata> GetMetadataForProperties(object container, Type containerType)
        {
            
            var attProvider = containerType.GetCustomAttributes(false).OfType<MetadataPropertiesProviderAttribute>().FirstOrDefault();

            if (attProvider != null)
            {
                return attProvider.GetMetadataForProperties(base.GetMetadataForProperties, this, container, containerType);
            }
          
            var thing= base.GetMetadataForProperties(container, containerType);

            return thing;
        }
    }

    public delegate IEnumerable<ModelMetadata> GetMetadataForPropertiesHandler(object container, Type containerType);

    public interface IModelMetadataContainer
    {
        ModelMetadata GetModelMetadata();
    }

    public interface IModelMetadataParentContainer
    {
        ModelMetadata GetModelMetadata(string property);
    }

    public interface IModelMetadataAncestorDependantItem
    {
        ModelMetadata GetModelMetadata(IList<Object> ancestors);
    }

    public abstract class MetadataPropertiesProviderAttribute : Attribute
    {
        public abstract IEnumerable<ModelMetadata> GetMetadataForProperties(GetMetadataForPropertiesHandler handler, ModelMetadataProvider provider,  object container, Type containerType);
    }

    public abstract class MetadataProcessorAttribute : Attribute
    {
        /// <summary>
        /// Method for processing custom attribute data.
        /// </summary>
        /// <param name="modelMetaData">A ModelMetaData instance.</param>
        public abstract void Process(ModelMetadata modelMetaData);
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