using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    public class Company
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string ContactEmail { get; set; }
        public Guid? AdminId { get; set; }
        public User? Admin { get; set; }
        public ICollection<User>? Employees { get; set; } = new List<User>();
        public ICollection<Fridge>? Fridges { get; set; } = new List<Fridge>();
    }
}
