using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin")]
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly string _dbConnectionString;

        public BackupController(IConfiguration config)
        {
            _dbConnectionString = config.GetConnectionString("DefaultConnection");
        }

        [HttpGet("create-backup")]
        public async Task<IActionResult> CreateBackup([FromQuery] string folderPath)
        {
            if (string.IsNullOrEmpty(folderPath))
            {
                return BadRequest("Error! Folder path is not provided.");
            }

            if (!Directory.Exists(folderPath))
            {
                return BadRequest("Error! Specified folder does not exist.");
            }

            string backupFilePath = Path.Combine(folderPath, "SmartLunchDatabaseBackup.bak");

            try
            {
                using (var connection = new SqlConnection(_dbConnectionString))
                {
                    await connection.OpenAsync();
                    string query = @"
                        BACKUP DATABASE [SmartLunchDb]
                        TO DISK = @BackupPath
                        WITH FORMAT, INIT;";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@BackupPath", backupFilePath);
                        await command.ExecuteNonQueryAsync();
                    }
                }

                return Ok($"Backup created successfully at {backupFilePath}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating backup: {ex.Message}");
            }
        }

        [HttpPost("restore-database")]
        public async Task<IActionResult> RestoreFromBackup([FromQuery] string folderPath, IFormFile backupFile)
        {
            if (backupFile == null || backupFile.Length == 0)
            {
                return BadRequest("Error! Backup file is not provided or empty.");
            }

            if (string.IsNullOrEmpty(folderPath))
            {
                return BadRequest("Error! Folder path is not provided.");
            }

            if (!Directory.Exists(folderPath))
            {
                return BadRequest("Error! Specified folder does not exist.");
            }

            string filePath = Path.Combine(folderPath, "UploadedBackup.bak");

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await backupFile.CopyToAsync(stream);
                }

                using (var connection = new SqlConnection(_dbConnectionString))
                {
                    await connection.OpenAsync();

                    string query = @"
                        USE master;
                        ALTER DATABASE [SmartLunchDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                        RESTORE DATABASE [SmartLunchDb]
                        FROM DISK = @BackupPath
                        WITH REPLACE;
                        ALTER DATABASE [SmartLunchDb] SET MULTI_USER;";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@BackupPath", filePath);
                        await command.ExecuteNonQueryAsync();
                    }
                }

                return Ok("Database restored successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error restoring database: {ex.Message}");
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }
    }
}
