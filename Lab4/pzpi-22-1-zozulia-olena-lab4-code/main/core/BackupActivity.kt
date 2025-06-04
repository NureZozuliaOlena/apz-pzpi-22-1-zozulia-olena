package com.example.smart_lunch.core

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.smart_lunch.R
import com.example.smart_lunch.auth.SessionManager
import com.example.smart_lunch.orders.AdminOrdersActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

class BackupActivity : AppCompatActivity() {

    private lateinit var backupButton: Button
    private lateinit var restoreButton: Button

    private lateinit var backupFilePath: String
    private lateinit var backupFolderPath: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_backup)

        backupFolderPath = getExternalFilesDir(null)?.absolutePath ?: ""
        backupFilePath = "$backupFolderPath/SmartLunchDatabaseBackup.bak"

        backupButton = findViewById(R.id.backupButton)
        restoreButton = findViewById(R.id.restoreButton)

        backupButton.setOnClickListener {
            performBackup()
        }

        restoreButton.setOnClickListener {
            val file = File(backupFilePath)
            if (file.exists()) {
                performRestore(file)
            } else {
                Toast.makeText(this, "Файл не знайдено: $backupFilePath", Toast.LENGTH_SHORT).show()
            }
        }

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNav)
        bottomNav.selectedItemId = R.id.nav_backup

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_orders -> {
                    startActivity(Intent(this, AdminOrdersActivity::class.java))
                    true
                }
                R.id.nav_backup -> true
                R.id.nav_logout -> {
                    SessionManager.clearToken(this)
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                    true
                }
                else -> false
            }
        }
    }

    private fun performBackup() {
        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.getApi().createBackup()

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    withContext(Dispatchers.IO) {
                        val file = File(backupFilePath)
                        body.byteStream().use { input ->
                            FileOutputStream(file).use { output ->
                                input.copyTo(output)
                            }
                        }
                    }
                    Toast.makeText(this@BackupActivity, "Бекап збережено: $backupFilePath", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@BackupActivity, "Помилка: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@BackupActivity, "Помилка бекапу: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performRestore(file: File) {
        lifecycleScope.launch {
            try {
                val requestBody = file.asRequestBody("application/octet-stream".toMediaTypeOrNull())
                val part = MultipartBody.Part.createFormData("backupFile", file.name, requestBody)

                val response = RetrofitInstance.getApi().restoreBackup(part)

                if (response.isSuccessful) {
                    Toast.makeText(this@BackupActivity, "Успішно відновлено", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@BackupActivity, "Помилка відновлення: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@BackupActivity, "Помилка відновлення: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }


}
