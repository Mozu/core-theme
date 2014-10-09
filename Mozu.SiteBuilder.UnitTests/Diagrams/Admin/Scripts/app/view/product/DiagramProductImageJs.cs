using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.product
{

    class cdTacoSharedViewFieldImage : cdExtFormFieldContainer
    {
        public cdTacoSharedViewModalImageMetadata modal;

        public cdExtFormFieldField mixinsField;

        public void onItemClick() { }
        
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
        
    }
}
