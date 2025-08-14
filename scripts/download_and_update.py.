import json
import requests
import os

# Define the path to your wallpapers.json file
JSON_FILE = 'wallpapers.json'
# Define the directory where you want to save the images
DOWNLOAD_DIR = 'wallpapers'

# Create the download directory if it doesn't exist
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_and_update_json():
    """
    Reads a JSON file, downloads images from external links,
    updates the JSON with local paths, and saves the images.
    """
    try:
        with open(JSON_FILE, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {JSON_FILE} not found. Make sure it's in the same directory.")
        return

    updated_wallpapers = []
    
    for i, wallpaper in enumerate(data):
        image_url = wallpaper.get('url')
        if not image_url or not image_url.startswith('http'):
            print(f"Skipping wallpaper {i+1}: URL is not a valid external link. Keeping existing path.")
            updated_wallpapers.append(wallpaper)
            continue

        filename = image_url.split('/')[-1].split('?')[0]
        save_path = os.path.join(DOWNLOAD_DIR, filename)

        print(f"Downloading {image_url}...")
        try:
            response = requests.get(image_url, stream=True)
            response.raise_for_status()

            with open(save_path, 'wb') as image_file:
                for chunk in response.iter_content(chunk_size=8192):
                    image_file.write(chunk)
            print(f"Saved {filename} to {DOWNLOAD_DIR}")
            
            wallpaper['url'] = os.path.join(DOWNLOAD_DIR, filename).replace('\\', '/')
            updated_wallpapers.append(wallpaper)

        except requests.exceptions.RequestException as e:
            print(f"Failed to download {image_url}: {e}")
            print(f"Keeping old URL for wallpaper {i+1}.")
            updated_wallpapers.append(wallpaper)

    with open(JSON_FILE, 'w') as f:
        json.dump(updated_wallpapers, f, indent=4)
    print(f"\nSuccessfully updated {JSON_FILE} with new image paths.")

if __name__ == "__main__":
    download_and_update_json()
