using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTO;
using Repositories;
using AutoMapper;
using Models;

namespace Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IMapper _mapper;

        public UserController(IUserRepository userRepository, ICompanyRepository companyRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _companyRepository = companyRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            var userDtos = _mapper.Map<List<UserDto>>(users); 
            return Ok(userDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var userDto = _mapper.Map<UserDto>(user); 
            return Ok(userDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = _mapper.Map<User>(userDto);

            if (userDto.CompanyId.HasValue)
            {
                var company = await _companyRepository.GetByIdAsync(userDto.CompanyId.Value);
                if (company == null)
                {
                    return BadRequest("Invalid CompanyId. Company does not exist.");
                }

                user.CompanyId = company.Id;

                if (company.Employees == null)
                {
                    company.Employees = new List<User>();
                }
                company.Employees.Add(user);

                await _companyRepository.UpdateAsync(company);
            }

            await _userRepository.AddAsync(user);

            var createdUserDto = _mapper.Map<UserDto>(user); 
            return CreatedAtAction(nameof(GetById), new { id = createdUserDto.Id }, createdUserDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userRepository.GetByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound("User not found.");
            }

            _mapper.Map(userDto, existingUser);

            if (userDto.CompanyId.HasValue)
            {
                var newCompany = await _companyRepository.GetByIdAsync(userDto.CompanyId.Value);
                if (newCompany == null)
                {
                    return BadRequest("Invalid CompanyId. Company does not exist.");
                }

                var oldCompany = existingUser.Company;
                if (oldCompany != null && oldCompany.Id != newCompany.Id)
                {
                    oldCompany.Employees?.Remove(existingUser);
                    await _companyRepository.UpdateAsync(oldCompany);
                }

                if (newCompany.Employees == null)
                {
                    newCompany.Employees = new List<User>();
                }
                newCompany.Employees.Add(existingUser);

                existingUser.CompanyId = newCompany.Id;
            }
            else
            {
                var oldCompany = existingUser.Company;
                if (oldCompany != null)
                {
                    oldCompany.Employees?.Remove(existingUser);
                    await _companyRepository.UpdateAsync(oldCompany);
                }

                existingUser.CompanyId = null;
            }

            await _userRepository.UpdateAsync(existingUser);

            var updatedUserDto = _mapper.Map<UserDto>(existingUser);
            return Ok(updatedUserDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            await _userRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
