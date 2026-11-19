package com.minecoords.client.keybinds;

import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

public class ModKeyBindings {
    public static KeyBinding openShareGuiKey;

    public static void register() {
        openShareGuiKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "key.minecoords.open_gui",
                InputUtil.Type.KEYSYM,
                GLFW.GLFW_KEY_K, // Tecla K por defecto
                "category.minecoords.general"
        ));
    }
}
