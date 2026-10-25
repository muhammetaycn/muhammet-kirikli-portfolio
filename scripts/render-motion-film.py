"""Render original, periodic ribbon geometry to a silent local WebM.

No reference-site media, generative service or paid API is used.
Requires Python, numpy, Pillow and ffmpeg. Run from any directory.
"""
from pathlib import Path
import math
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "motion"
WIDTH, HEIGHT, FPS, DURATION, AA = 640, 400, 20, 7.2, 2
TAU = math.tau


def rotation(rx, ry, rz):
    sx, cx, sy, cy, sz, cz = math.sin(rx), math.cos(rx), math.sin(ry), math.cos(ry), math.sin(rz), math.cos(rz)
    x = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    y = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    z = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return z @ y @ x


def mesh(phase, size, width, orientation, offset):
    t = np.linspace(0, TAU, 193)[:, None]
    v = np.linspace(-width, width, 9)[None, :]
    radius = 1.28 + v * np.cos(1.5 * t)
    points = np.stack(np.broadcast_arrays(radius * np.cos(t), .78 * radius * np.sin(t), .34 * np.sin(2 * t) + v * np.sin(1.5 * t)), axis=-1)
    points *= size
    transform = rotation(orientation[0] + .13 * math.sin(phase), orientation[1] + .18 * math.cos(phase), orientation[2] + .07 * math.sin(phase))
    return points @ transform.T + np.asarray(offset)


def render(index, frames):
    phase = TAU * index / frames
    image = Image.new("RGB", (WIDTH * AA, HEIGHT * AA), (5, 7, 7))
    draw = ImageDraw.Draw(image)
    light = np.array([-.7 + .35 * math.cos(phase), -.9, 1.8 + .2 * math.sin(phase)])
    light /= np.linalg.norm(light)
    camera = np.array([0., 0., 1.])
    half = light + camera
    half /= np.linalg.norm(half)
    breath = .58 + .42 * math.sin(phase * .5) ** 2
    faces = []
    for size, width, angle, offset, tint in [
        (1., .19, (.8, .48, -.42), (.20, .0, -.1), np.array([.95, .91, .83])),
        (.71, .24, (-.65, -.67, .36), (-.28, -.06, .23), np.array([.78, .80, .76])),
        (1.25, .065, (1.02, .8, -.18), (.06, .02, .03), np.array([.84, .78, .68])),
    ]:
        points = mesh(phase, size, width, angle, offset)
        for row in range(points.shape[0] - 1):
            for col in range(points.shape[1] - 1):
                p = points[row:row + 2, col:col + 2]
                vertices = np.array([p[0, 0], p[1, 0], p[1, 1], p[0, 1]])
                normal = np.cross(vertices[1] - vertices[0], vertices[3] - vertices[0])
                normal /= max(np.linalg.norm(normal), 1e-9)
                diffuse = abs(normal @ light)
                specular = abs(normal @ half) ** 35
                rim = (1 - abs(normal @ camera)) ** 3
                strength = (10 + diffuse ** 1.8 * 83 + specular * 144 + rim * 27) * breath
                color = tuple(np.clip(strength * tint + np.array([2., 3., 3.]), 0, 255).astype(int))
                perspective = 4.8 / (4.8 - vertices[:, 2])
                screen = np.stack([WIDTH * .66 + vertices[:, 0] * perspective * 128, HEIGHT * .52 + vertices[:, 1] * perspective * 128], axis=1) * AA
                faces.append((vertices[:, 2].mean(), screen, color))
    for _, screen, color in sorted(faces, key=lambda face: face[0]):
        draw.polygon([tuple(point) for point in screen], fill=color)
    image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    return np.asarray(image, dtype=np.uint8).tobytes()


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    binary = shutil.which("ffmpeg")
    if not binary:
        raise SystemExit("ffmpeg was not found on PATH")
    frames = round(DURATION * FPS)
    command = [binary, "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-pix_fmt", "yuv420p", str(DEST / "suspended-ribbons.webm")]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(frames):
            process.stdin.write(render(index, frames))
        process.stdin.close()
        code = process.wait()
        if code:
            raise SystemExit(code)
    except BaseException:
        process.kill()
        process.wait()
        raise
    path = DEST / "suspended-ribbons.webm"
    print(f"Rendered {frames} frames, {WIDTH}x{HEIGHT}, {FPS}fps, {DURATION}s, {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
