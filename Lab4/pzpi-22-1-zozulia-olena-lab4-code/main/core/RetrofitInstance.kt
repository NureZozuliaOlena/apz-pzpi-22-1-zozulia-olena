package com.example.smart_lunch.core

import android.content.Context
import com.example.smart_lunch.auth.AuthInterceptor
import com.example.smart_lunch.auth.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitInstance {
    private const val BASE_URL = "http://10.0.2.2:5235/"
    private var api: SmartLunchService? = null

    fun initialize(context: Context, force: Boolean = false) {
        if (api != null && !force) return

        val token = SessionManager.getToken(context) ?: ""

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor(AuthInterceptor(token))
            .build()

        api = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SmartLunchService::class.java)
    }

    fun getApi(): SmartLunchService {
        return api ?: throw IllegalStateException("RetrofitInstance not initialized")
    }
}
