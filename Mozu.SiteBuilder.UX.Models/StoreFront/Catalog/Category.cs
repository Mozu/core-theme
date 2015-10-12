using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    public class Category:ModelBase , IModelMetadataParentContainer
    {
        [AlternateName("detailsUrl")]
        public string Url
        {
            get
            {
                return "/category/" + this.CategoryId;

            }
        }
        [AlternateName("id")]
        public int CategoryId { get; set; }
        [AlternateName("parentid")]
        public int? ParentCategoryId { get; set; }
        public Category ParentCategory { get; set; }


        [AlternateName("name")]
        [AdditionalMetadata("fieldName", "name")]
        [AdditionalMetadata("showLabel", true)]
        [AdditionalMetadata("fieldLabel", "Category Name Edit")]
        [AdditionalMetadata("fieldType", "text")]
        public string Name { get; set; }
        public string Slug { get; set; }

        public int? Index { get; set; }

        public string Description { get; set; }


        [AlternateName("description")]
        [AdditionalMetadata("fieldName", "description")]
        [AdditionalMetadata("showLabel", true)]
        [AdditionalMetadata("fieldLabel", "Category description Edit")]
        [AdditionalMetadata("fieldType", "html")]
        public string PageTitle { get; set; }
        public string MetaTagTitle { get; set; }
        public string MetaTagDescription { get; set; }
        public string MetaTagKeywords { get; set; }
        [AlternateName("categories")]
        public List<Category> ChildrenCategories { get; set; }

        Dictionary<string, ModelMetadata> _metaDataDictionary;
        public ModelMetadata GetModelMetadata(string propertyName)
        {
            if (_metaDataDictionary == null)
            {
                _metaDataDictionary = new Dictionary<string, ModelMetadata>();
            }

            ModelMetadata metaData;

            if (_metaDataDictionary.TryGetValue(propertyName, out metaData))
            {
                return metaData;
            }

            var prop = this.GetAlternateNamedProperty(propertyName);
            
            if (prop == null)
            {
                _metaDataDictionary[propertyName] = null;
                return null;
            }

            metaData = ModelMetadataProviders.Current.GetMetadataForProperty(() => prop.GetValue(this, null), this.GetType(), propertyName);

            if (!metaData.AdditionalValues.ContainsKey("fieldType"))
            {
                metaData.AdditionalValues["fieldType"] = "text";
            }
           

            metaData.AdditionalValues["id"] = this.CategoryId ;
            metaData.AdditionalValues["entityType"] = "category";

            _metaDataDictionary[propertyName] = metaData;
            return metaData;
        }
    }
}