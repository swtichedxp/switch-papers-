import json
import requests
import os

JSON_FILE = 'wallpapers.json'
DOWNLOAD_DIR = 'wallpapers'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_and_update_json():
    try:
        with open(JSON_FILE, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {JSON_FILE} not found. Make sure it's in the same directory.")
        return

    # Check if the data has the expected 'categories' key
    if 'categories' not in data or not isinstance(data['categories'], list):
        print(f"Error: {JSON_FILE} does not contain a 'categories' list.")
        return

    # Iterate through each category
    for category in data['categories']:
        if 'wallpapers' not in category or not isinstance(category['wallpapers'], list):
            print(f"Skipping category '{category.get('name', 'unknown')}': No 'wallpapers' list found.")
            continue
            
        # Iterate through each wallpaper within the category
        for i, wallpaper in enumerate(category['wallpapers']):
            if not isinstance(wallpaper, dict):
                print(f"Skipping item {i+1} in category '{category.get('name', 'unknown')}': Not a valid wallpaper object.")
                continue

            image_url = wallpaper.get('url')
            if not image_url or not image_url.startswith('http'):
                print(f"Skipping wallpaper: URL is not a valid external link. Keeping existing path.")
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

            except requests.exceptions.RequestException as e:
                print(f"Failed to download {image_url}: {e}")
                print(f"Keeping old URL for wallpaper.")

    with open(JSON_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"\nSuccessfully updated {JSON_FILE} with new image paths.")

if __name__ == "__main__":
    download_and_update_json()
