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
using AutoMapper.Internal;

namespace NDjango.FiltersCS
{
    ///// <summary>
    /////     Hex encodes characters for use in JavaScript strings.
    /////     This does not make the string safe for use in HTML, but does protect you from syntax errors 
    /////     when using templates to generate JavaScript/JSON.
    ///// </summary>
    //[NDjango.Interfaces.Name("safe")]
    //public class SafeFilter : NDjango.Interfaces.ISimpleFilter
    //{
        
    //    public object Perform(object __p1)
    //    {

    //        return new SafeString()
    //               {
    //                   InnerString = __p1.ToNullSafeString()
    //               };
    //    }

    //    //         (string text).Replace("&","&amp;").Replace("<","&lt;").Replace(">","&gt;").Replace("'","&#39;").Replace("\"","&quot;")    
    //}

    //public class IHtmlString 
    //{
    //    public string InnerString { get; set; }
    //    public override string ToString()
    //    {
    //        return InnerString;
    //    }
    //}
}