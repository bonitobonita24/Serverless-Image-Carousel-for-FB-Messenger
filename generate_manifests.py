#!/usr/bin/env python3
"""
Generate manifest.json for all client folders under public/clients/.

Scans each client directory for image files and creates/updates a manifest.json
that the gallery page uses to dynamically load images.

Usage:
    python3 generate_manifests.py                  # Process all clients
    python3 generate_manifests.py lushcamp         # Process specific client
    python3 generate_manifests.py lushcamp acme    # Process multiple clients
"""

import json
import os
import re
import sys

BASE_DIR = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "public", "clients")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png",
                    ".gif", ".webp", ".svg", ".bmp", ".avif"}


def filename_to_caption(filename: str) -> str:
    """Convert a filename like 'AirconRooms.jpg' to 'Aircon Rooms'."""
    name = os.path.splitext(filename)[0]
    # Insert space before uppercase letters (camelCase/PascalCase)
    name = re.sub(r"([a-z])([A-Z])", r"\1 \2", name)
    # Replace underscores, hyphens with spaces
    name = name.replace("_", " ").replace("-", " ")
    # Clean up multiple spaces
    name = re.sub(r"\s+", " ", name).strip()
    return name


def client_name_to_title(client_dir: str) -> str:
    """Convert 'lushcamp' to 'Lushcamp Image Gallery'."""
    name = client_dir.replace("-", " ").replace("_", " ")
    return name.title() + " Image Gallery"


def generate_manifest(client_dir: str) -> dict | None:
    """Generate manifest for a single client directory."""
    client_path = os.path.join(BASE_DIR, client_dir)

    if not os.path.isdir(client_path):
        print(f"  ✗ '{client_dir}' is not a directory, skipping")
        return None

    # Find all image files
    images = []
    for f in sorted(os.listdir(client_path)):
        ext = os.path.splitext(f)[1].lower()
        if ext in IMAGE_EXTENSIONS:
            caption = filename_to_caption(f)
            images.append({
                "src": f,
                "alt": caption,
                "caption": caption
            })

    if not images:
        print(f"  ⚠ No images found in '{client_dir}', skipping")
        return None

    manifest = {
        "client": client_dir,
        "title": client_name_to_title(client_dir),
        "images": images
    }

    # Write manifest.json
    manifest_path = os.path.join(client_path, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")

    print(f"  ✓ {client_dir}: {len(images)} image(s) → manifest.json")
    return manifest


def main():
    if not os.path.isdir(BASE_DIR):
        print(f"Error: Client directory not found: {BASE_DIR}")
        print("Make sure you have a 'public/clients/' directory.")
        sys.exit(1)

    # Determine which clients to process
    if len(sys.argv) > 1:
        client_dirs = sys.argv[1:]
    else:
        client_dirs = sorted([
            d for d in os.listdir(BASE_DIR)
            if os.path.isdir(os.path.join(BASE_DIR, d))
        ])

    if not client_dirs:
        print("No client directories found in:", BASE_DIR)
        sys.exit(0)

    print(f"Generating manifests for {len(client_dirs)} client(s)...\n")

    success = 0
    for client_dir in client_dirs:
        result = generate_manifest(client_dir)
        if result:
            success += 1

    print(f"\nDone! Generated {success}/{len(client_dirs)} manifest(s).")


if __name__ == "__main__":
    main()
