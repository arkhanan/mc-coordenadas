package com.minecoords.client;

import com.minecoords.client.gui.ShareCoordinateScreen;
import com.minecoords.client.keybinds.ModKeyBindings;
import com.minecoords.config.ModConfig;
import com.minecoords.network.SupabaseClient;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.text.Text;

public class MineCoordsClient implements ClientModInitializer {
    public static final String MOD_ID = "minecoords";

    @Override
    public void onInitializeClient() {
        System.out.println("[MineCoords] Inicializando MineCoords Client Mod...");

        // Cargar o inicializar configuración
        ModConfig.get();

        // Registrar tecla rápida (Tecla K por defecto)
        ModKeyBindings.register();

        // Escuchar pulsación de teclas (Tecla K abre GUI)
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            while (ModKeyBindings.openShareGuiKey.wasPressed()) {
                if (client.player != null && client.world != null) {
                    client.setScreen(new ShareCoordinateScreen(client.player));
                }
            }
        });

        // Registrar comandos de cliente: /minecoords gui, /minecoords share <nombre>, /minecoords link <codigo>
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(
                ClientCommandManager.literal("minecoords")
                    // 1. Abrir GUI
                    .then(ClientCommandManager.literal("gui")
                        .executes(context -> {
                            MinecraftClient client = MinecraftClient.getInstance();
                            client.send(() -> {
                                if (client.player != null) {
                                    client.setScreen(new ShareCoordinateScreen(client.player));
                                }
                            });
                            return 1;
                        })
                    )
                    // 2. Vincular cuenta con Discord: /minecoords link <codigo>
                    .then(ClientCommandManager.literal("link")
                        .then(ClientCommandManager.argument("codigo", StringArgumentType.word())
                            .executes(context -> {
                                String codigo = StringArgumentType.getString(context, "codigo");
                                ClientPlayerEntity player = MinecraftClient.getInstance().player;
                                if (player == null) return 0;

                                player.sendMessage(Text.literal("§e[MineCoords] Verificando código §f" + codigo + "§e con Discord..."), false);
                                SupabaseClient.linkAccount(codigo, player.getName().getString());
                                return 1;
                            })
                        )
                    )
                    // 3. Compartir directo sin GUI: /minecoords share <nombre>
                    .then(ClientCommandManager.literal("share")
                        .then(ClientCommandManager.argument("nombre", StringArgumentType.greedyString())
                            .executes(context -> {
                                String nombreLugar = StringArgumentType.getString(context, "nombre");
                                ClientPlayerEntity player = MinecraftClient.getInstance().player;
                                if (player == null) return 0;

                                String dim = player.getWorld().getRegistryKey().getValue().getPath().toLowerCase();
                                String dimName = dim.contains("nether") ? "Nether" : (dim.contains("end") ? "The End" : "Overworld");

                                player.sendMessage(Text.literal("§e[MineCoords] Guardando: " + nombreLugar + "..."), false);

                                SupabaseClient.submitCoordinate(
                                    nombreLugar,
                                    "Compartido con comando /minecoords",
                                    "Otros",
                                    dimName,
                                    Math.round(player.getX()),
                                    Math.round(player.getY()),
                                    Math.round(player.getZ()),
                                    player.getName().getString(),
                                    null
                                );
                                return 1;
                            })
                        )
                    )
            );
        });

        System.out.println("[MineCoords] MineCoords listo. Usa la tecla K o /minecoords gui");
    }
}
