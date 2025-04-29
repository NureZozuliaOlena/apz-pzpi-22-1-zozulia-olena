using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public DateTime DateTimeCreated { get; set; }
        public Guid? UserId { get; set; }
        public User User { get; set; }
        public Guid? FridgeId { get; set; }
    }
}
