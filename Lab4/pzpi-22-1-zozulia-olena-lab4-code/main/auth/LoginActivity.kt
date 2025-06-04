package com.example.smart_lunch.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.smart_lunch.fridge.HomeActivity
import com.example.smart_lunch.R
import com.example.smart_lunch.core.RetrofitInstance
import com.example.smart_lunch.dto.LoginDto
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        RetrofitInstance.initialize(this@LoginActivity)

        emailEditText = findViewById(R.id.email_edit_text)
        passwordEditText = findViewById(R.id.password_edit_text)
        loginButton = findViewById(R.id.login_button)

        loginButton.setOnClickListener {
            loginUser()
        }
    }

    private fun loginUser() {
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, getString(R.string.enter_email_password), Toast.LENGTH_SHORT).show()
            return
        }

        val loginDto = LoginDto(email = email, password = password)

        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.getApi().login(loginDto)
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body != null) {
                        val token = body.token
                        val role = body.role
                        val userId = body.userId.toString()

                        SessionManager.saveToken(this@LoginActivity, token)

                        val sharedPref = getSharedPreferences("auth", MODE_PRIVATE)
                        sharedPref.edit()
                            .putString("userRole", role?.lowercase())
                            .putString("userId", userId)
                            .apply()

                        RetrofitInstance.initialize(this@LoginActivity, force = true)

                        Toast.makeText(this@LoginActivity, getString(R.string.login_successful), Toast.LENGTH_SHORT).show()

                        startActivity(Intent(this@LoginActivity, HomeActivity::class.java))
                        finish()
                    }
                }
                else {
                    Log.e("LOGIN", "Login failed: ${response.errorBody()?.string()}")
                    Toast.makeText(this@LoginActivity, getString(R.string.login_failed), Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("LOGIN", "Error: ${e.message}")
                Toast.makeText(this@LoginActivity, getString(R.string.login_error, e.message), Toast.LENGTH_SHORT).show()
            }
        }
    }

}
