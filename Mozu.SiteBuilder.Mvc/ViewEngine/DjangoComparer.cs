using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Runtime.Caching;
using System.Web;

using Autofac;
using NDjango;
using NDjango.Interfaces;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class DjangoComparer : Comparer<object>
    {
        public override int Compare(object x, object y)
        {
            Type xtype = x == null ? typeof(DataColumn) : x.GetType();
            Type ytype = y == null ? typeof(DataColumn) : y.GetType();
            if (x == null && y != null)
            {
                return 1;
            }
            if (y == null && x != null)
            {
                return -1;
            }

            if (x is string && y is string)
            {
                return StringComparer.OrdinalIgnoreCase.Compare(x, y);
            }

            if (xtype != ytype)
            {
                if (xtype.IsValueType && ytype.IsValueType)
                {
                    double xdVal = Convert.ToDouble(x);
                    double ydVal = Convert.ToDouble(y);
                    return xdVal == ydVal ? 0 : 1;
                    return StringComparer.OrdinalIgnoreCase.Compare(x.ToString(), y.ToString());
                }
                if ((xtype.IsValueType || xtype == typeof(string)) && (ytype.IsValueType || ytype == typeof(string)))
                {
                    return StringComparer.OrdinalIgnoreCase.Compare(x.ToString(), y.ToString());
                }
            }
            try
            {
                return Default.Compare(x, y);
            }
            catch (Exception ex)
            {
            
                //todo: handle valid use cases
                throw new Exception("tell phipps", ex);
            }
        }
    }
}
