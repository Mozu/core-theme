using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Users
{
    [DataContract]
    public class Role : ModelBase
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "behaviors")]
        public List<Behavior> Behaviors { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "isEditable")]
        public bool IsEditable { get; set; }
    }

    [DataContract]
    public class RoleBehavior : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "roleId")]
        public int RoleId { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "children")]
        public List<int> Children { get; set; }
    }

    [DataContract]
    public class Behavior : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        public int CategoryId { get; set; }

        public BehaviorCategory Category { get; set; }
    }

    [DataContract]
    public class BehaviorCategory : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        public int ParentCategoryId { get; set; }

        public IEnumerable<BehaviorCategory> Categories { get; set; }

        public IEnumerable<Behavior> Behaviors { get; set; }
    }

    [DataContract]
    public class BehaviorTree : ModelBase
    {
        public BehaviorTree(IEnumerable<BehaviorCategory> categories, IEnumerable<Behavior> behaviors)
        {
            Nodes = (from c in categories
                     let node = BuildNode(c, categories, behaviors)
                     select node).ToList();
        }

        private static BehaviorTreeNode BuildNode(BehaviorCategory category, IEnumerable<BehaviorCategory> categories, IEnumerable<Behavior> behaviors)
        {
            category.Behaviors = behaviors.Where(x => x.CategoryId == category.Id);
            category.Categories = categories.Where(x => x.ParentCategoryId == category.Id);

            return new BehaviorTreeNode
            {
                Id = category.Id,
                Name = category.Name,
                Cls = "behavior-category",
                Children = category.Categories.Select(c => BuildNode(c, categories, behaviors)).Concat(category.Behaviors.Select(CreateBehavior)).ToList(),
            };
        }

        private static BehaviorTreeNode CreateBehavior(Behavior behavior)
        {
            return new BehaviorTreeNode
            {
                Cls = "behavior",
                Name = behavior.Name,
                Id = behavior.Id,
            };
        }

        [DataMember(Name = "nodes")]
        public List<BehaviorTreeNode> Nodes { get; set; }

        [DataContract]
        public class BehaviorTreeNode : ModelBase
        {
            [DataMember(Name = "id")]
            public int Id { get; set; }

            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "cls")]
            public string Cls { get; set; }

            [DataMember(Name = "selected")]
            public bool Selected { get; set; }

            [DataMember(Name = "children")]
            public List<BehaviorTreeNode> Children { get; set; }
        }
    }
}