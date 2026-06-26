from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'demo.gif'
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = 1200, 720
BG = (11, 15, 20)
PANEL = (22, 27, 34)
BORDER = (55, 65, 81)
TEXT = (230, 237, 243)
MUTED = (148, 163, 184)
GREEN = (74, 222, 128)
RED = (248, 113, 113)
YELLOW = (250, 204, 21)
BLUE = (96, 165, 250)

try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 24)
    FONT_SM = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 20)
    FONT_LG = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 28)
except Exception:
    FONT = FONT_SM = FONT_LG = ImageFont.load_default()

prompt = 'Run exactly one shell command and nothing else: python3 /path/to/hello.py'
blocked_cmd = '$ python3 /path/to/hello.py'
blocked_msg = (
    'Blocked: python3 is deliberately disabled for OpenCode shell execution.\n'
    'Reason: this project must use Pixi-managed Python environments, not bare python/python3.\n'
    'Use: pixi run python /path/to/hello.py'
)
fixed_cmd = '$ pixi run python /path/to/hello.py'
fixed_out = 'Hello World'


def terminal_frame(lines, title='OpenCode smoke test'):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    pad = 36
    d.rounded_rectangle((pad, pad, W - pad, H - pad), radius=18, fill=PANEL, outline=BORDER, width=2)
    # title bar
    d.rounded_rectangle((pad, pad, W - pad, pad + 52), radius=18, fill=(30, 41, 59), outline=BORDER, width=2)
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        x = pad + 22 + i * 22
        d.ellipse((x, pad + 17, x + 12, pad + 29), fill=color)
    d.text((pad + 110, pad + 12), title, font=FONT_SM, fill=MUTED)

    x = pad + 28
    y = pad + 74
    line_h = 34
    for text, color in lines:
        for segment in text.split('\n'):
            d.text((x, y), segment, font=FONT, fill=color)
            y += line_h
    return img

frames = []

frames.append(terminal_frame([
    ('Goal: block bare python/python3 and point agent to Pixi', BLUE),
    ('', TEXT),
    ('User prompt:', MUTED),
    (prompt, TEXT),
]))

for n in (18, 38, len(blocked_cmd)):
    frames.append(terminal_frame([
        ('User prompt:', MUTED),
        (prompt, TEXT),
        ('', TEXT),
        (blocked_cmd[:n], GREEN),
    ]))

frames.append(terminal_frame([
    ('User prompt:', MUTED),
    (prompt, TEXT),
    ('', TEXT),
    (blocked_cmd, GREEN),
    ('', TEXT),
    (blocked_msg, RED),
]))

frames.append(terminal_frame([
    ('Corrective path:', YELLOW),
    (fixed_cmd, GREEN),
    ('', TEXT),
    (fixed_out, TEXT),
]))

frames[0].save(
    OUT,
    save_all=True,
    append_images=frames[1:],
    duration=[1400, 700, 700, 900, 2200, 1600],
    loop=0,
    optimize=False,
)
print(OUT)
