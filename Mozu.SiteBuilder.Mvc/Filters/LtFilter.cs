/****************************************************************************
 * 
 *  NDjango Parser Copyright © 2009 Hill30 Inc
 *
 *  This file is part of the NDjango Parser.
 *
 *  The NDjango Parser is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The NDjango Parser is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with NDjango Parser.  If not, see <http://www.gnu.org/licenses/>.
 *  
 ***************************************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace NDjango.FiltersCS
{
    /// <summary>
    ///     Hex encodes characters for use in JavaScript strings.
    ///     This does not make the string safe for use in HTML, but does protect you from syntax errors 
    ///     when using templates to generate JavaScript/JSON.
    /// </summary>
    [NDjango.Interfaces.Name("lt")]
    public class LtFilter : NDjango.Interfaces.IFilter 
    {
        #region ISimpleFilter Members
       

        public object Perform(object __p1)
        {
            throw new NotImplementedException();
        }

        #endregion

        public object DefaultValue
        {
            get { return false; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            if (value is Newtonsoft.Json.Linq.JValue)
            {
                value = ((Newtonsoft.Json.Linq.JValue)value).Value;
            }
            if (parameter is Newtonsoft.Json.Linq.JValue)
            {
                parameter = ((Newtonsoft.Json.Linq.JValue)parameter).Value;
            }

            if (value is string && ((string)value).Length == 0  )
            {
                return parameter == null || (parameter is string && ((string)parameter).Length == 0);
            }
            if (parameter is string && ((string)parameter).Length == 0)
            {
                return false;
            }
            if (value is Int32)
            {
                return (int)value < Convert.ToInt32(parameter);
            }
            if (value is Int64)
            {
                return (Int64)value < Convert.ToInt64(parameter);
            }

            return false;
        }
    }
    
}