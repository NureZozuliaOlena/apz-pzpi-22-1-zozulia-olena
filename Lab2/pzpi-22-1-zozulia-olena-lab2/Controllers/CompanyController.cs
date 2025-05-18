using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public CompanyController(ICompanyRepository companyRepository, IUserRepository userRepository, IMapper mapper)
        {
            _companyRepository = companyRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var companies = await _companyRepository.GetAllAsync();
                var companyDtos = _mapper.Map<List<CompanyDto>>(companies);
                return Ok(companyDtos);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                var company = await _companyRepository.GetByIdAsync(companyId);
                if (company == null)
                    return NotFound();

                var companyDto = _mapper.Map<CompanyDto>(company);
                return Ok(new List<CompanyDto> { companyDto });
            }

            return Forbid();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null)
                return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var companyDto = _mapper.Map<CompanyDto>(company);
                return Ok(companyDto);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (company.Id != companyId)
                    return Forbid("Access denied. This is not your company.");

                var companyDto = _mapper.Map<CompanyDto>(company);
                return Ok(companyDto);
            }

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompanyDto companyDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var company = _mapper.Map<Company>(companyDto);

            if (companyDto.AdminId.HasValue)
            {
                var admin = await _userRepository.GetByIdAsync(companyDto.AdminId.Value);
                if (admin == null)
                {
                    return BadRequest("Invalid AdminId.");
                }

                company.Admin = admin;
                await _companyRepository.AddAsync(company);

                admin.CompanyId = company.Id;
                await _userRepository.UpdateAsync(admin);
            }
            else
            {
                await _companyRepository.AddAsync(company);
            }

            var createdCompanyDto = _mapper.Map<CompanyDto>(company);
            return CreatedAtAction(nameof(GetById), new { id = createdCompanyDto.Id }, createdCompanyDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CompanyDto companyDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null)
                return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Admin")
            {
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (company.Id != companyId)
                    return Forbid("Access denied. This is not your company.");
            }

            _mapper.Map(companyDto, company);
            await _companyRepository.UpdateAsync(company);
            var updatedDto = _mapper.Map<CompanyDto>(company);
            return Ok(updatedDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null)
                return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Admin")
            {
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (company.Id != companyId)
                    return Forbid("Access denied. This is not your company.");
            }

            await _companyRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
