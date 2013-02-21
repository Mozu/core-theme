using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Filters
{
  

    [NDjango.Interfaces.Name("default_edit")]
    public class DefaultEditFilter : NDjango.Interfaces.IFilterWithContext
    {



        public object PerformWithParamAndContext(object value, object parameter, NDjango.Interfaces.IContext context)
        {
            return PerformWithParam(value, parameter);
        }

        public object DefaultValue
        {
            get { return null; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            var isEditmode = SiteBuilderContext.Current.IsEditMode;
            if (!isEditmode)
            {
                return value;
            }
            if (value == null || value is string && string.IsNullOrEmpty((string)value))
            {
                return parameter;
            }
            return value;
        }

        public object Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}
