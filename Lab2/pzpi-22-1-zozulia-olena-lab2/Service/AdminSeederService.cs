using Data;
using Enums;
using Helpers;
using Models;

namespace Service
{
    public class AdminSeederService
    {
        private readonly SmartLunchDbContext _context;

        public AdminSeederService(SmartLunchDbContext context)
        {
            _context = context;
        }

        public async Task SeedAdminAsync()
        {
            if (_context.Users.Any(u => u.Email == "adminsmartlunch@gmail.com"))
            {
                return;
            }

            var admin = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Super",
                LastName = "Admin",
                DateOfBirth = new DateTime(2005, 1, 13),
                PhoneNumber = "1234567890",
                Email = "adminsmartlunch@gmail.com",
                Role = UserRole.Admin
            };

            var passwordHash = PasswordHelper.HashPassword("Password123!");
            admin.PasswordHash = passwordHash;

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();
        }
    }
}
