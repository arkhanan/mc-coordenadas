from pathlib import Path
import textwrap

OUT = Path("docs/Guia-Discord-MineCoords.pdf")
PAGE_W, PAGE_H = 595, 842
MARGIN = 52

PAGES = [
    [
        ("title", "MINECOORDS EN DISCORD"),
        ("subtitle", "Guía para el dueño del servidor"),
        ("note", "Documento de instalación y uso en Discord. No incluye configuración técnica del servicio."),
        ("h", "Qué hace la aplicación"),
        ("p", "MCCoordenadas agrega comandos slash para consultar y administrar coordenadas de Minecraft. La instalación requiere autorización del dueño o de alguien con permiso para administrar el servidor."),
        ("h", "Comandos disponibles en la versión de prueba"),
        ("bullet", "/coordenadas listar — muestra coordenadas activas recientes."),
        ("bullet", "/coordenadas agregar — registra nombre, categoría, dimensión, X, Y, Z y una descripción opcional."),
        ("bullet", "/coordenadas archivar — archiva una coordenada mediante su ID. El autor archiva las propias; moderadores y administradores pueden archivar cualquiera."),
        ("p", "Las respuestas son privadas para quien ejecuta el comando. Para agregar coordenadas, la persona debe tener su perfil de MineCoords vinculado con Discord."),
        ("h", "Permisos que solicita"),
        ("p", "La aplicación usa el scope applications.commands. No solicita permisos de administrador, moderación, lectura de mensajes ni historial. Los comandos funcionan en canales donde esté permitido Usar comandos de aplicaciones."),
        ("note", "La aplicación no necesita un proceso de bot conectado continuamente ni permisos para leer mensajes del canal."),
    ],
    [
        ("title", "INSTALAR EN EL SERVIDOR"),
        ("subtitle", "Pasos para el dueño o administrador"),
        ("h", "1. Abrir el enlace"),
        ("p", "Abre este enlace de instalación de MCCoordenadas:"),
        ("code", "https://discord.com/oauth2/authorize?client_id=1572238890851373208&scope=applications.commands&integration_type=0"),
        ("h", "2. Autorizar la aplicación"),
        ("bullet", "Inicia sesión con la cuenta que administra el servidor."),
        ("bullet", "Selecciona el servidor correcto en el menú."),
        ("bullet", "Revisa que solicite comandos de aplicación y no permisos administrativos."),
        ("bullet", "Pulsa Continuar y después Autorizar."),
        ("h", "3. Confirmar que quedó instalada"),
        ("p", "En Discord abre Ajustes del servidor → Integraciones → Bots y aplicaciones. Debe aparecer MCCoordenadas."),
        ("note", "Discord puede pedir permiso para administrar el servidor a la persona que realiza la instalación. Ese permiso corresponde a la cuenta instaladora; no se concede a la aplicación."),
        ("h", "Importante: registro por servidor"),
        ("p", "Los comandos están registrados actualmente en un servidor de prueba. Instalar la aplicación no los copia automáticamente a otro servidor. Después de autorizarla, quien mantiene MineCoords debe registrar el comando para el servidor nuevo."),
    ],
    [
        ("title", "ÚLTIMO PASO Y CONTROL"),
        ("subtitle", "Qué falta para que aparezcan los comandos"),
        ("h", "Compartir el ID del servidor"),
        ("bullet", "En Discord: Ajustes de usuario → Avanzado → activa Modo de desarrollador."),
        ("bullet", "Haz clic derecho en el nombre o icono del servidor y elige Copiar ID del servidor."),
        ("bullet", "Envía ese ID a quien mantiene MineCoords por un canal privado. El ID no es un token ni una contraseña."),
        ("bullet", "Quien mantiene la aplicación registra /coordenadas para ese servidor. Después, los miembros podrán usar listar, agregar y archivar."),
        ("h", "Si el comando no aparece"),
        ("bullet", "Confirma que MCCoordenadas aparece en Ajustes del servidor → Integraciones → Bots y aplicaciones."),
        ("bullet", "Escribe / en un canal de texto y revisa que el canal permita Usar comandos de aplicaciones."),
        ("bullet", "Pide a quien mantiene MineCoords que registre el comando para el ID de este servidor."),
        ("h", "Quitar la aplicación"),
        ("p", "Desde Ajustes del servidor → Integraciones → Bots y aplicaciones, abre MCCoordenadas y selecciona la opción para quitarla o gestionar su acceso."),
        ("h", "Enlaces oficiales de Discord"),
        ("link", "Comandos de aplicación: https://docs.discord.com/developers/docs/interactions/slash-commands"),
        ("link", "Encontrar el ID del servidor: https://support.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID"),
        ("note", "No compartas tokens de bot ni claves privadas. El dueño del servidor no los necesita para instalar la aplicación."),
    ],
]


def pdf_text(text: str) -> bytes:
    raw = text.encode("cp1252", errors="replace")
    escaped = raw.hex().upper().encode("ascii")
    return b"<" + escaped + b"> Tj"


def line_cmd(text: str, x: int, y: int, font: str, size: int, color: tuple[float, float, float]) -> bytes:
    r, g, b = color
    return f"{r:.3f} {g:.3f} {b:.3f} rg BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ".encode("ascii") + pdf_text(text) + b" ET\n"


def wrap(text: str, width: int) -> list[str]:
    return textwrap.wrap(text, width=width, break_long_words=True, break_on_hyphens=False) or [""]


def make_page(blocks: list[tuple[str, str]], page_no: int, page_count: int) -> bytes:
    stream = bytearray()
    stream.extend(b"q 0.345 0.396 0.949 rg 0 826 595 16 re f Q\n")
    y = 786
    for kind, text in blocks:
        if kind == "title":
            stream.extend(line_cmd(text, MARGIN, y, "F2", 21, (0.12, 0.15, 0.23)))
            y -= 31
        elif kind == "subtitle":
            stream.extend(line_cmd(text, MARGIN, y, "F1", 13, (0.35, 0.39, 0.49)))
            y -= 29
        elif kind == "h":
            y -= 4
            stream.extend(line_cmd(text, MARGIN, y, "F2", 13, (0.20, 0.25, 0.43)))
            y -= 21
        elif kind == "note":
            for part in wrap(text, 82):
                stream.extend(line_cmd(part, MARGIN + 8, y, "F1", 9, (0.32, 0.36, 0.44)))
                y -= 14
            y -= 7
        elif kind == "bullet":
            lines = wrap(text, 79)
            stream.extend(line_cmd("• " + lines[0], MARGIN, y, "F1", 10, (0.13, 0.15, 0.20)))
            y -= 15
            for part in lines[1:]:
                stream.extend(line_cmd(part, MARGIN + 12, y, "F1", 10, (0.13, 0.15, 0.20)))
                y -= 15
            y -= 4
        elif kind == "code":
            for part in wrap(text, 80):
                stream.extend(line_cmd(part, MARGIN + 8, y, "F3", 8, (0.22, 0.26, 0.38)))
                y -= 13
            y -= 6
        elif kind == "link":
            for part in wrap(text, 82):
                stream.extend(line_cmd(part, MARGIN, y, "F1", 8, (0.22, 0.31, 0.63)))
                y -= 12
            y -= 4
        else:
            for part in wrap(text, 86):
                stream.extend(line_cmd(part, MARGIN, y, "F1", 10, (0.13, 0.15, 0.20)))
                y -= 15
            y -= 5

    stream.extend(b"0.80 0.82 0.87 RG 52 48 m 543 48 l S\n")
    stream.extend(line_cmd("MCCoordenadas  |  Guía para servidor Discord", MARGIN, 30, "F1", 8, (0.40, 0.43, 0.50)))
    stream.extend(line_cmd(f"{page_no} / {page_count}", 510, 30, "F1", 8, (0.40, 0.43, 0.50)))
    return bytes(stream)


def build_pdf() -> None:
    objects: list[bytes | None] = [None]
    def add(obj: bytes) -> int:
        objects.append(obj)
        return len(objects) - 1

    catalog_id = add(b"")
    pages_id = add(b"")
    font_regular = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    font_bold = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    font_mono = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>")
    page_ids = []
    count = len(PAGES)

    for i, blocks in enumerate(PAGES, start=1):
        stream = make_page(blocks, i, count)
        content_id = add(b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"endstream")
        page_id = add(f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] /Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R /F3 {font_mono} 0 R >> >> /Contents {content_id} 0 R >>".encode("ascii"))
        page_ids.append(page_id)

    objects[catalog_id] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode("ascii")
    kids = " ".join(f"{obj_id} 0 R" for obj_id in page_ids)
    objects[pages_id] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("ascii")

    pdf = bytearray(b"%PDF-1.4\n%MineCoords\n")
    offsets = [0]
    for obj_id, obj in enumerate(objects[1:], start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{obj_id} 0 obj\n".encode("ascii"))
        pdf.extend(obj or b"")
        pdf.extend(b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(f"trailer\n<< /Size {len(objects)} /Root {catalog_id} 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii"))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(pdf)
    print(f"PDF creado: {OUT} ({len(pdf)} bytes)")


if __name__ == "__main__":
    build_pdf()
