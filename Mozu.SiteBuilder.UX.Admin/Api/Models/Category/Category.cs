using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Category
{
    [DataContract]
    public class Category
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }
        string _catCode;
        [DataMember(Name = "code")]
        public string CategoryCode
        {
            get{ return string.IsNullOrEmpty ( _catCode )?  System.Guid.NewGuid ().ToString () : _catCode ;}
            set{ _catCode = value ;}
        }

        [DataMember(Name = "slug")]
        public string Slug { get; set; }

        [DataMember(Name = "siteId")]
        public int? CatalogId { get; set; }

        //[DataMember(Name = "categoryPath")]
        //public string CategoryPath { get; set; }

        [DataMember(Name = "isHidden")]
        public bool? IsHidden { get; set; }

        [DataMember(Name = "parentId")]
        public int? ParentId { get; set; }

        [DataMember(Name = "index", EmitDefaultValue=true)]
        public int? Index { get; set; }

        [DataMember(Name = "productCount")]
        public int? ProductCount { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        //[DataMember(Name = "internalName")]
        //public string InternalName { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "sequence")]
        public int? Sequence { get; set; }

        [DataMember(Name = "pageTitle")]
        public string PageTitle { get; set; }
        [DataMember(Name = "metaTitle")]
        public string MetaTitle { get; set; }
        [DataMember(Name = "metaDescription")]
        public string MetaDescription { get; set; }
        [DataMember(Name = "metaKeywords")]
        public string MetaKeywords { get; set; }


        [DataMember(Name = "path", EmitDefaultValue = false)]
        public string Path { get; set; }


        [IgnoreDataMember]
        public Category Parent { get; set; }
    }
}