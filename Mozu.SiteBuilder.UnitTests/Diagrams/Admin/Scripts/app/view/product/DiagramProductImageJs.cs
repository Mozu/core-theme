using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product
{

    class cdTacoSharedViewFieldImage : cdExtFormFieldContainer
    {
        public object[] filters;

        public cdTacoSharedViewModalImageMetadata modal;

        public cdExtFormFieldField mixinsField;

        public cdSharedStoreFiles[] selectedImages;

        public void onItemClick() { }

        public void setValue(object value) { }

        public void onSelectedImagesDataChanged() { }
        
    }

    class cdSharedStoreFiles
    {
        public SharedModelFile model;
    }

    class SharedModelFile
    {
        public string cmsId;
        public string name;
        public string alt;
        public bool isUploaded;
        public string url;

        public object proxy;
    }

    class cdTacoViewProductSubformGeneral
    {
        public cdTacoSharedViewFieldImage imagesConfig;

        public void onImageMetadataUpdated(string imgMetadata) { }

        public void beforeSave() { }

    }

    class cdTacoSharedViewModalImageMetadata : cdTacoCoreUxWindowModal
    {
        public string alt;

        public void doSave() {  }
    }

    class cdExtFormFieldContainer
    {
        
    }

    class cdTacoCoreUxWindowModal
    {
        
    }

    class cdExtFormFieldField
    {
        public void setValue() { }

        public void load(object[] filters) { }
    }
}
