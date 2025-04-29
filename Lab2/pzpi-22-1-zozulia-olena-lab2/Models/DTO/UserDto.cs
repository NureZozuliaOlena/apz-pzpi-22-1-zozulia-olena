using Enums;
using System.Text.Json.Serialization;

namespace Models.DTO
{
    public class UserDto
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public Guid? CompanyId { get; set; }

        [JsonIgnore]
        public ICollection<Notification>? Notifications { get; set; } = new List<Notification>();
        [JsonIgnore]
        public ICollection<Order>? Orders { get; set; } = new List<Order>();
    }
}
