using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Data;
using Enums;
using Helpers;
using Models;
using Models.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SmartLunchDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(SmartLunchDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrEmpty(registerDto.FirstName) ||
                string.IsNullOrEmpty(registerDto.LastName) ||
                string.IsNullOrEmpty(registerDto.Email) ||
                string.IsNullOrEmpty(registerDto.Password) ||
                string.IsNullOrEmpty(registerDto.PhoneNumber) ||
                registerDto.DateOfBirth == default)
            {
                return BadRequest("All fields are required.");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
            {
                return Conflict("User with this email already exists.");
            }

            if (!Enum.IsDefined(typeof(UserRole), registerDto.Role))
            {
                return BadRequest("Invalid role selected.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                DateOfBirth = registerDto.DateOfBirth,
                PhoneNumber = registerDto.PhoneNumber,
                Email = registerDto.Email,
                PasswordHash = PasswordHelper.HashPassword(registerDto.Password),
                Role = registerDto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var hashedPassword = PasswordHelper.HashPassword(loginDto.Password);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.PasswordHash == hashedPassword);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            if (user.CompanyId.HasValue)
                claims.Add(new Claim("CompanyId", user.CompanyId.Value.ToString()));

            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: signingCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == changePasswordDto.Email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var hashedCurrentPassword = PasswordHelper.HashPassword(changePasswordDto.CurrentPassword);
            if (user.PasswordHash != hashedCurrentPassword)
            {
                return BadRequest("Current password is incorrect.");
            }

            user.PasswordHash = PasswordHelper.HashPassword(changePasswordDto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully.");
        }
    }
}
