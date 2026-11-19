package com.minecoords.network;

import com.minecoords.config.ModConfig;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

public class SupabaseClient {
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Publica una coordenada capturada en el juego
     */
    public static void submitCoordinate(
            String nombre,
            String descripcion,
            String categoria,
            String dimension,
            double x,
            double y,
            double z,
            String playerName,
            Consumer<Boolean> onResult
    ) {
        ModConfig config = ModConfig.get();
        String endpoint = config.supabaseUrl + "/rest/v1/rpc/crear_coordenada_desde_mod";

        String safeNombre = escapeJson(nombre);
        String safeDescripcion = escapeJson(descripcion);
        String safeCategoria = escapeJson(categoria);
        String safeDimension = escapeJson(dimension);
        String safePlayer = escapeJson(playerName);

        String jsonPayload = String.format(
                "{\"p_nombre\":\"%s\",\"p_descripcion\":\"%s\",\"p_categoria\":\"%s\",\"p_dimension\":\"%s\",\"p_x\":%.1f,\"p_y\":%.1f,\"p_z\":%.1f,\"p_jugador\":\"%s\"}",
                safeNombre, safeDescripcion, safeCategoria, safeDimension, x, y, z, safePlayer
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("apikey", config.supabaseAnonKey)
                .header("Authorization", "Bearer " + config.supabaseAnonKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        CompletableFuture.runAsync(() -> {
            try {
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int status = response.statusCode();

                MinecraftClient.getInstance().execute(() -> {
                    if (status >= 200 && status < 300) {
                        if (config.sendChatMessageOnSuccess && MinecraftClient.getInstance().player != null) {
                            MinecraftClient.getInstance().player.sendMessage(
                                    Text.literal("§a[MineCoords] §f¡Coordenada §e" + nombre + " §fpublicada con éxito en la web!"),
                                    false
                            );
                        }
                        if (onResult != null) onResult.accept(true);
                    } else {
                        System.err.println("[MineCoords] Error enviando coordenada: " + response.body());
                        if (MinecraftClient.getInstance().player != null) {
                            MinecraftClient.getInstance().player.sendMessage(
                                    Text.literal("§c[MineCoords] Error al publicar (HTTP " + status + "). Revisa tu conexion."),
                                    false
                            );
                        }
                        if (onResult != null) onResult.accept(false);
                    }
                });
            } catch (Exception e) {
                System.err.println("[MineCoords] Error HTTP: " + e.getMessage());
                MinecraftClient.getInstance().execute(() -> {
                    if (MinecraftClient.getInstance().player != null) {
                        MinecraftClient.getInstance().player.sendMessage(
                                Text.literal("§c[MineCoords] Error de conexion: " + e.getMessage()),
                                false
                        );
                    }
                    if (onResult != null) onResult.accept(false);
                });
            }
        });
    }

    /**
     * Vincula el usuario de Minecraft con la cuenta de Discord usando el código de la web
     */
    public static void linkAccount(String code, String playerName) {
        ModConfig config = ModConfig.get();
        String endpoint = config.supabaseUrl + "/rest/v1/rpc/vincular_cuenta_minecraft";

        String jsonPayload = String.format(
                "{\"p_codigo\":\"%s\",\"p_jugador\":\"%s\"}",
                escapeJson(code.trim().toUpperCase()),
                escapeJson(playerName)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("apikey", config.supabaseAnonKey)
                .header("Authorization", "Bearer " + config.supabaseAnonKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        CompletableFuture.runAsync(() -> {
            try {
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                String body = response.body();

                MinecraftClient.getInstance().execute(() -> {
                    if (MinecraftClient.getInstance().player == null) return;

                    if (body.contains("\"success\":true")) {
                        MinecraftClient.getInstance().player.sendMessage(
                                Text.literal("§a[MineCoords] §l¡CUENTA VINCULADA CON ÉXITO! §r§fTu jugador §e" + playerName + " §fahora está vinculado con tu perfil de Discord."),
                                false
                        );
                    } else {
                        MinecraftClient.getInstance().player.sendMessage(
                                Text.literal("§c[MineCoords] §lError al vincular: §r§fCódigo inválido o expirado. Genera uno nuevo en la web."),
                                false
                        );
                    }
                });
            } catch (Exception e) {
                MinecraftClient.getInstance().execute(() -> {
                    if (MinecraftClient.getInstance().player != null) {
                        MinecraftClient.getInstance().player.sendMessage(
                                Text.literal("§c[MineCoords] Error de conexión al vincular: " + e.getMessage()),
                                false
                        );
                    }
                });
            }
        });
    }

    private static String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }
}
