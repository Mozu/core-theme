using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Runtime.Serialization;
using Mozu.Content.Contracts;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using C = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class CmsDocumentBase : IModelMetadataParentContainer , IModelMetadataContainer 
    {  
        
        public CmsDocumentBase(ICmsTypeHelper typeHelper , Mozu.SiteBuilder.UX.Models.IEditableContext context)
        {
            TypeHelper = typeHelper;
            Context = context;
        }
        
        //adding a space  so that i can check this file in and add  comments in tfs........ spoiler alert its about taco's horible-"ness" 
       

        public static dynamic EmptyProperty
        {
            get
            {
                var j = new JObject();
                return j.DeToken();
            }
        }
        Mozu.SiteBuilder.UX.Models.IEditableContext Context
        {
            get;
            set;
        }
        [DataMember(Name = "id")]
        public string Id { get; set; }
        public bool IsPreview { get; set; }

        
        [DataMember(Name = "properties")]
        public CmsPropertyCollection Properties { get; set; }

        [DataMember(Name = "documentType")]
        public string DocumentTypeName { get; set; }
        
        [DataMember(Name="collection")]
        public string Collection { get; set; }

        
        //public DocumentType DocType { get; set; }

        ICmsTypeHelper _th;
        public ICmsTypeHelper TypeHelper
        {
            get
            {
                if (_th == null)
                {
                    _th = DependencyResolver.Current.GetService<ICmsTypeHelper>();
                }
                return _th;
            }
            set
            {
                _th = value;
            }
        } 


        public object  this[string key]
        {
            get{
                //todo look up prop type.

                var cmsProp = Properties[key];
                var propDef = TypeHelper.GetPropertyType(key).Result;
                object retValue = null;
                if (cmsProp != null)
                {
                    retValue = cmsProp.Value;
                }
                if (Context.IsEditMode ) //&& retValue == null || ((string) retValue.length == 0)  cmsProp != null && (cmsProp.Value  == null || cmsProp.IsEmpty))
                {
                    cmsProp = cmsProp ?? new CmsProperty(this.TypeHelper, key);
                    if (cmsProp.Value == null || cmsProp.IsEmpty)
                    {
                        retValue =  cmsProp.DefaultEditValue;
                    }
                    
                }

                return retValue;
            }
        }
        public string DocumentType { get; set; }

        public DateTime? InsertDate { get; set; }
        public string Name { get; set; }
        public string ParentFolderId { get; set; }
        public string Path { get; set; }
        public string Status { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string Version { get; set; }

        public Dictionary<string, ModelMetadata> ModelMetadataCache = new Dictionary<string, ModelMetadata>(StringComparer.OrdinalIgnoreCase);
        public virtual System.Web.Mvc.ModelMetadata GetModelMetadata(string propertyName)
        {
            
            ModelMetadata mmd;
            if (ModelMetadataCache.TryGetValue(propertyName, out mmd))
            {
                return mmd;
            }


            

            mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => this[propertyName], typeof(string), propertyName);


            //mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => prop.GetValue(this, null), prop.PropertyType, propertyName);
            mmd.AdditionalValues["documentId"] = this.Id ;
            mmd.AdditionalValues["collection"] = this.Collection ;
            mmd.AdditionalValues["documentType"] = this.DocumentTypeName ;
            mmd.AdditionalValues["fieldName"] = propertyName.ToLowerInvariant() ;
            mmd.AdditionalValues["isShadow"] = this.IsPreview ;
            
            mmd.AdditionalValues["entityType"] = "cms";

            var propInfo = TypeHelper.GetPropertyType(propertyName).Result;
            if (propInfo == null)
            {
                return mmd;
            }
            mmd.AdditionalValues["fieldType"] = propInfo.PropertyValueType.Name + (propInfo.IsMultiValued.GetValueOrDefault(false) ? "-repeating" : null);


            if (!propInfo.IsMultiValued.GetValueOrDefault (false ))
            {
                switch (propInfo.PropertyValueType.Name)
                {
                    case ("image"):
                        {
                            mmd.AdditionalValues["editDefault"] = "{ \"src\":\"/admin/scripts/resources/images/AddPhotos.png\", \"alt\":\"food is good\" }";
                            break;
                        }
                    case ("html"):
                        {
                            mmd.AdditionalValues["editDefault"] = "Click here to edit.";
                            break;
                        }
                    case ("text"):
                        {
                            mmd.AdditionalValues["editDefault"] = "Click here to edit.";
                            break;
                        }
                }
            }
            
                

            
            return mmd;
        }

        public virtual ModelMetadata GetModelMetadata()
        {
            var mmd = ModelMetadataProviders.Current.GetMetadataForType(() => this, typeof(CmsDocumentBase));
           
            mmd.AdditionalValues["data-attribute-name"] = "data-editing-widget";
            mmd.AdditionalValues["documentId"] = this.Id;
            mmd.AdditionalValues["collection"] = this.Collection;
            mmd.AdditionalValues["documentType"] = this.DocumentTypeName ;

            mmd.AdditionalValues["isShadow"] = this.IsPreview;
            


            
            return mmd;
        }
    }

    public class CmsPropertyCollection : List<CmsProperty>
    {
        public CmsPropertyCollection ()
        {}
        public CmsPropertyCollection(IEnumerable<CmsProperty> vals)
            : base(vals)
        {

        }
        public CmsProperty this[string key]
        {
            get
            {
                return this.FirstOrDefault ( x=> string.Equals (  x.Key,  key, StringComparison.OrdinalIgnoreCase) );
            }
            set
            {
                var prop = this[key];
                if (prop == null)
                {
                    this.Add(value );
                }
                prop.RawValue = value.RawValue ;
                
            }
        }
        public object GetValue(string key)
        {
            var val = this[key];
            if (val != null)
                return val.RawValue;
            
            return null;

        }
        public void Set(string key, object value, C.PropertyType typeInfo)
        {
            var prop = this[key];
            if (prop == null)
            {
                prop = new CmsProperty(key, value, typeInfo);
                this.Add(prop );
            }
            prop.RawValue = value;
        }
    }

    [DataContract(Name = "cmsProperty")]
    public class CmsProperty
    {
        static JObject g_image = JObject.Parse("{ \"src\":\"/admin/scripts/resources/images/AddPhotos.png\", \"alt\":\"food is good\" }");
        public CmsProperty(ICmsTypeHelper typeHelper)
        {
            TypeHelper = typeHelper;
            _jObj = new Lazy<Object >(CreatreJObj);
        }
        public CmsProperty(ICmsTypeHelper typeHelper , string key )
        {
            this.Key = key;
            TypeHelper = typeHelper;
            _jObj = new Lazy<Object>(CreatreJObj);
        }
        public CmsProperty(string key, object value, C.PropertyType typeInfo)
        {
            this.Key = key;
            this.RawValue = value;
            
            this.TypeInfo = typeInfo;
            _jObj = new Lazy<Object>(CreatreJObj);
        }

        ICmsTypeHelper _th;
        ICmsTypeHelper TypeHelper
        {
            get
            {
                if (_th == null)
                {
                    _th = DependencyResolver.Current.GetService<ICmsTypeHelper>();
                }
                return _th;
            }
            set
            {
                _th = value;
            }
        }
        C.PropertyType _pt;
        public C.PropertyType TypeInfo
        {
            get{
                if (_pt == null)
                {
                    _pt = TypeHelper.GetPropertyType(this.Key).Result;
                    if (_pt == null)
                    {
                        _pt = new Mozu.Content.Contracts.PropertyType()
                        {
                            PropertyValueType = new Mozu.Content.Contracts.PropertyValueType()
                            {
                                StorageType = "string",
                                Name = "text"
                            }
                        };
                    }
                }
                return _pt;
            }
            set
            {
                _pt = value;
            }
        }


        Lazy<Object> _jObj;
        
        Object  CreatreJObj()
        {
            try
            {
                if (this.RawValue is string && ((string)this.RawValue ).Length > 0  )
                {
                    var x =  JObject.Parse((string)this.RawValue);
                    return x.DeToken ();
                }
            }
            catch
            {
                
            }
            return null;
            
        }

        public override string ToString()
        {
            return RawValue.ToString();
        }

        

 

 

        [DataMember(Name = "key")]
        public string Key { get; set; }
        [DataMember(Name = "value")]
        public object RawValue { get; set; }

        public object Value
        {
            get
            {
                if (this.RawValue is string && this.TypeInfo.PropertyValueType.Name == "image" || this.TypeInfo.PropertyValueType.Name == "json" || this.TypeInfo.Name == "widget_configuration")
                {
                    return this.Json;
                }
                return RawValue;
            }
        }
        public bool IsEmpty
        {
            get { return this.RawValue == null || (this.RawValue is string && ((string)this.RawValue).Length == 0); }
        }
            
        public object DefaultEditValue
        {
            get
            {
                if (this.TypeInfo.IsMultiValued.GetValueOrDefault(false))
                {
                    return RawValue;
                }
                if (this.TypeInfo.PropertyValueType.Name == "image")
                {
                    return g_image;
                }
                if (this.TypeInfo.PropertyValueType.Name == "text" || this.TypeInfo.PropertyValueType.Name == "html")
                {
                    return "Click here to edit.";
                }

                if (this.RawValue is string && this.TypeInfo.PropertyValueType.Name == "image" || this.TypeInfo.PropertyValueType.Name == "json")
                {
                    return this.Json;
                }
                return RawValue;
            }
        }

        public Object Json
        {
            get { return _jObj.Value; }
        }
        public object this[string key ]
        {
            get
            {
                
                JToken  jval = null;
                if (_jObj.Value != null)
                {
                    jval = ((dynamic)_jObj.Value)["key"];
                }
                return jval;
            }
        }


        public static implicit operator double?(CmsProperty prop)
        {
            if (prop == null || prop.RawValue == null)
            {
                return null;
            }
            return Convert.ToDouble(prop.RawValue);
        }
        
        public static implicit operator string(CmsProperty prop)
        {
            return (string)prop.RawValue;
        }
        public static implicit operator int?(CmsProperty prop)
        {
            if (prop == null || prop.RawValue == null)
            {
                return null;
            }
            return Convert.ToInt32(prop.RawValue);

        }
        public static implicit operator DateTime?(CmsProperty prop)
        {
            if (prop == null || prop.RawValue == null)
            {
                return null;
            }
            return Convert.ToDateTime(prop.RawValue);
        }
        public static implicit operator bool?(CmsProperty prop)
        {
            if (prop == null || prop.RawValue == null)
            {
                return null;
            }
            return Convert.ToBoolean(prop.RawValue);
        }
    }
}

