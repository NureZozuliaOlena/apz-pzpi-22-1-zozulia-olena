using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "Admin")]
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
            var companies = await _companyRepository.GetAllAsync();
            var companyDtos = _mapper.Map<List<CompanyDto>>(companies);
            return Ok(companyDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            var companyDto = _mapper.Map<CompanyDto>(company);
            return Ok(companyDto);
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
            {
                return BadRequest(ModelState);
            }

            var existingCompany = await _companyRepository.GetByIdAsync(id);
            if (existingCompany == null)
            {
                return NotFound();
            }

            _mapper.Map(companyDto, existingCompany);
            await _companyRepository.UpdateAsync(existingCompany);

            var updatedCompanyDto = _mapper.Map<CompanyDto>(existingCompany);
            return Ok(updatedCompanyDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            await _companyRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
