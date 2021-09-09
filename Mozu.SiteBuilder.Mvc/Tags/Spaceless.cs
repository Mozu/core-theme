// -----------------------------------------------------------------------
// <copyright file="ComplexEmptyTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("spaceless")]
    public class Spaceless : AsyncContainerNode
    {
        static Regex spaces_re = new Regex("(?'spaces'>\\s+<)", RegexOptions.Compiled);
        public override string EndTag => "endspaceless";

        public override string ProcessContent(string content)
        {
            var ret = spaces_re.Replace(content, "><");
            return ret; ;
        }
    }
}