package com.minecoords.client.gui;

import com.minecoords.network.SupabaseClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.TextFieldWidget;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.text.Text;

public class ShareCoordinateScreen extends Screen {
    private final ClientPlayerEntity player;
    private final double posX;
    private final double posY;
    private final double posZ;
    private final String dimensionName;
    private final String playerName;

    private TextFieldWidget nameField;
    private TextFieldWidget descField;
    private ButtonWidget categoryButton;
    private ButtonWidget submitButton;

    private static final String[] CATEGORIES = {
            "Granja", "Base", "Portal", "Comercio", "Spawner", "Minería", "Redstone", "Otros"
    };
    private int currentCategoryIndex = 0;
    private String statusMessage = "";
    private int statusColor = 0xFFFFFF;

    public ShareCoordinateScreen(ClientPlayerEntity player) {
        super(Text.translatable("gui.minecoords.title"));
        this.player = player;
        this.posX = Math.round(player.getX() * 10.0) / 10.0;
        this.posY = Math.round(player.getY() * 10.0) / 10.0;
        this.posZ = Math.round(player.getZ() * 10.0) / 10.0;
        this.playerName = player.getName().getString();

        String dimId = player.getWorld().getRegistryKey().getValue().getPath().toLowerCase();
        if (dimId.contains("nether")) {
            this.dimensionName = "Nether";
        } else if (dimId.contains("end")) {
            this.dimensionName = "The End";
        } else {
            this.dimensionName = "Overworld";
        }
    }

    @Override
    protected void init() {
        int centerX = this.width / 2;
        int startY = 55;

        // Campo Nombre
        this.nameField = new TextFieldWidget(this.textRenderer, centerX - 120, startY, 240, 20, Text.literal("Nombre"));
        this.nameField.setMaxLength(60);
        this.nameField.setPlaceholder(Text.literal("Ej: Granja de Aldeanos / Portal"));
        this.addSelectableChild(this.nameField);

        // Campo Descripción
        this.descField = new TextFieldWidget(this.textRenderer, centerX - 120, startY + 35, 240, 20, Text.literal("Descripción"));
        this.descField.setMaxLength(120);
        this.descField.setPlaceholder(Text.literal("Detalles adicionales (opcional)"));
        this.addSelectableChild(this.descField);

        // Botón selector de Categoría
        this.categoryButton = ButtonWidget.builder(
                Text.literal("Categoría: §e" + CATEGORIES[currentCategoryIndex]),
                button -> {
                    currentCategoryIndex = (currentCategoryIndex + 1) % CATEGORIES.length;
                    button.setMessage(Text.literal("Categoría: §e" + CATEGORIES[currentCategoryIndex]));
                }
        ).dimensions(centerX - 120, startY + 65, 240, 20).build();
        this.addDrawableChild(this.categoryButton);

        // Botón Enviar / Publicar
        this.submitButton = ButtonWidget.builder(
                Text.literal("§a✔ Publicar en MineCoords"),
                button -> submitData()
        ).dimensions(centerX - 120, startY + 110, 115, 20).build();
        this.addDrawableChild(this.submitButton);

        // Botón Cancelar
        ButtonWidget cancelButton = ButtonWidget.builder(
                Text.literal("§cCancelar"),
                button -> this.close()
        ).dimensions(centerX + 5, startY + 110, 115, 20).build();
        this.addDrawableChild(cancelButton);

        this.setInitialFocus(this.nameField);
    }

    private void submitData() {
        String name = this.nameField.getText().trim();
        if (name.isEmpty()) {
            this.statusMessage = "§c¡Debes ponerle un nombre al lugar!";
            this.statusColor = 0xFF5555;
            return;
        }

        this.statusMessage = "§ePublicando en MineCoords (Supabase)...";
        this.statusColor = 0xFFFF55;
        this.submitButton.active = false;

        String desc = this.descField.getText().trim();
        String cat = CATEGORIES[currentCategoryIndex];

        SupabaseClient.submitCoordinate(
                name,
                desc,
                cat,
                this.dimensionName,
                this.posX,
                this.posY,
                this.posZ,
                this.playerName,
                success -> {
                    if (success) {
                        this.close();
                    } else {
                        this.statusMessage = "§cError al conectar. Revisa la consola/config.";
                        this.statusColor = 0xFF5555;
                        this.submitButton.active = true;
                    }
                }
        );
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);

        int centerX = this.width / 2;

        // Título
        context.drawCenteredTextWithShadow(this.textRenderer, "§6§lMineCoords §7- Compartir Coordenada", centerX, 15, 0xFFFFFF);

        // Info de posición actual
        String infoText = String.format("§7Jugador: §f%s  §7|  Dimensión: §b%s  §7|  §aX: §f%.0f  §aY: §f%.0f  §aZ: §f%.0f",
                this.playerName, this.dimensionName, this.posX, this.posY, this.posZ);
        context.drawCenteredTextWithShadow(this.textRenderer, infoText, centerX, 35, 0xAAAAAA);

        // Render de cajas de texto
        this.nameField.render(context, mouseX, mouseY, delta);
        this.descField.render(context, mouseX, mouseY, delta);

        // Mensaje de estado
        if (!this.statusMessage.isEmpty()) {
            context.drawCenteredTextWithShadow(this.textRenderer, this.statusMessage, centerX, 140, this.statusColor);
        }
    }

    @Override
    public boolean shouldPause() {
        return false; // No pausar el juego para que funcione fluido en multijugador
    }
}
