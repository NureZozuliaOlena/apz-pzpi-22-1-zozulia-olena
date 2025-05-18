using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class FridgeController : ControllerBase
    {
        private readonly IFridgeRepository _fridgeRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IMapper _mapper;

        public FridgeController(IFridgeRepository fridgeRepository, ICompanyRepository companyRepository, IMapper mapper)
        {
            _fridgeRepository = fridgeRepository;
            _companyRepository = companyRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var allFridges = await _fridgeRepository.GetAllAsync();
                return Ok(allFridges);
            }

            if (role == "Admin" || role == "Contractor")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                var companyFridges = await _fridgeRepository.GetByCompanyIdAsync(companyId);
                return Ok(companyFridges);
            }

            return Forbid();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var fridge = await _fridgeRepository.GetByIdAsync(id);
            if (fridge == null)
            {
                return NotFound();
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var fridgeDto = _mapper.Map<FridgeDto>(fridge);
                return Ok(fridgeDto);
            }

            if (role == "Admin" || role == "Contractor")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (fridge.CompanyId != companyId)
                    return Forbid("Access denied. Fridge does not belong to your company.");

                var fridgeDto = _mapper.Map<FridgeDto>(fridge);
                return Ok(fridgeDto);
            }

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FridgeDto fridgeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            Guid companyId;

            if (role == "Admin" || role == "Contractor")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out companyId))
                    return BadRequest("Invalid CompanyId claim.");

                fridgeDto.CompanyId = companyId;
            }
            else if (role == "SuperAdmin")
            {
                companyId = fridgeDto.CompanyId;
            }
            else
            {
                return Forbid();
            }

            var company = await _companyRepository.GetByIdAsync(companyId);
            if (company == null)
            {
                return BadRequest("Invalid CompanyId. Company does not exist.");
            }

            var fridge = _mapper.Map<Fridge>(fridgeDto);
            fridge.Company = company;

            await _fridgeRepository.AddAsync(fridge);

            var createdFridgeDto = _mapper.Map<FridgeDto>(fridge);
            return CreatedAtAction(nameof(GetById), new { id = createdFridgeDto.Id }, createdFridgeDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FridgeDto fridgeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingFridge = await _fridgeRepository.GetByIdAsync(id);
            if (existingFridge == null)
            {
                return NotFound();
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Admin" || role == "Contractor")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (existingFridge.CompanyId != companyId)
                    return Forbid("Access denied. Fridge does not belong to your company.");

                if (fridgeDto.CompanyId != companyId)
                    return Forbid("Cannot move fridge to another company.");
            }

            var newCompany = await _companyRepository.GetByIdAsync(fridgeDto.CompanyId);
            if (newCompany == null)
            {
                return BadRequest("Invalid CompanyId. Company does not exist.");
            }

            if (existingFridge.CompanyId != fridgeDto.CompanyId)
            {
                var oldCompany = await _companyRepository.GetByIdAsync(existingFridge.CompanyId);
                if (oldCompany != null)
                {
                    oldCompany.Fridges?.Remove(existingFridge);
                    await _companyRepository.UpdateAsync(oldCompany);
                }

                if (newCompany.Fridges == null)
                {
                    newCompany.Fridges = new List<Fridge>();
                }

                newCompany.Fridges.Add(existingFridge);
            }

            _mapper.Map(fridgeDto, existingFridge);
            await _fridgeRepository.UpdateAsync(existingFridge);
            await _companyRepository.UpdateAsync(newCompany);

            var updatedFridgeDto = _mapper.Map<FridgeDto>(existingFridge);
            return Ok(updatedFridgeDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var fridge = await _fridgeRepository.GetByIdAsync(id);
            if (fridge == null)
            {
                return NotFound();
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Admin" || role == "Contractor")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                if (fridge.CompanyId != companyId)
                    return Forbid("Access denied. Fridge does not belong to your company.");
            }

            await _fridgeRepository.DeleteAsync(id);
            return NoContent();
        }

    }
}
