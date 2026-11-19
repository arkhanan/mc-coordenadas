package com.minecoords.config;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.nio.file.Path;

public class ModConfig {
    public String supabaseUrl = "https://pozuejurachepdhpyygg.supabase.co";
    public String supabaseAnonKey = "sb_publishable_k_UHW6C0BipbTIFWWUSa5Q_cfSa6Zvh";
    public String serverIp = "AleeBonett.aternos.me";
    public boolean sendChatMessageOnSuccess = true;

    private static ModConfig INSTANCE;

    public static ModConfig get() {
        if (INSTANCE == null) {
            INSTANCE = load();
        }
        return INSTANCE;
    }

    public static ModConfig load() {
        File configFile = Path.of("config", "minecoords.json").toFile();
        if (!configFile.exists()) {
            ModConfig config = new ModConfig();
            config.save();
            return config;
        }

        try (FileReader reader = new FileReader(configFile)) {
            StringBuilder sb = new StringBuilder();
            int c;
            while ((c = reader.read()) != -1) {
                sb.append((char) c);
            }
            String content = sb.toString();

            ModConfig config = new ModConfig();
            // Extracción sencilla de valores sin dependencias externas
            config.supabaseUrl = extractJsonString(content, "supabaseUrl", config.supabaseUrl);
            config.supabaseAnonKey = extractJsonString(content, "supabaseAnonKey", config.supabaseAnonKey);
            config.serverIp = extractJsonString(content, "serverIp", config.serverIp);
            config.sendChatMessageOnSuccess = content.contains("\"sendChatMessageOnSuccess\": false") ? false : true;

            return config;
        } catch (Exception e) {
            System.err.println("[MineCoords] Error cargando configuración: " + e.getMessage());
            return new ModConfig();
        }
    }

    public void save() {
        try {
            File configDir = Path.of("config").toFile();
            if (!configDir.exists()) {
                configDir.mkdirs();
            }
            File configFile = Path.of("config", "minecoords.json").toFile();
            try (FileWriter writer = new FileWriter(configFile)) {
                writer.write("{\n");
                writer.write("  \"supabaseUrl\": \"" + supabaseUrl + "\",\n");
                writer.write("  \"supabaseAnonKey\": \"" + supabaseAnonKey + "\",\n");
                writer.write("  \"serverIp\": \"" + serverIp + "\",\n");
                writer.write("  \"sendChatMessageOnSuccess\": " + sendChatMessageOnSuccess + "\n");
                writer.write("}\n");
            }
        } catch (Exception e) {
            System.err.println("[MineCoords] Error guardando configuración: " + e.getMessage());
        }
    }

    private static String extractJsonString(String json, String key, String defaultVal) {
        String pattern = "\"" + key + "\":\\s*\"([^\"]+)\"";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return defaultVal;
    }
}
