package com.example.smart_lunch.auth

import android.content.Context
import android.content.SharedPreferences

object SessionManager {
    private const val PREF_NAME = "user_session"
    private const val TOKEN_KEY = "auth_token"

    fun clearToken(context: Context) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(TOKEN_KEY).apply()
    }

    fun saveToken(context: Context, token: String) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(TOKEN_KEY, token).apply()
    }

    fun getToken(context: Context): String? {
        val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        return prefs.getString(TOKEN_KEY, null)
    }
}