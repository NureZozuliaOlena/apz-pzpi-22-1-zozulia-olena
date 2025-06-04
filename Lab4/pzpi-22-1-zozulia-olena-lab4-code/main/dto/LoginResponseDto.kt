package com.example.smart_lunch.dto

data class LoginResponseDto(
    val userId: String,
    val token: String,
    val role: String
)
