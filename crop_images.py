import os
from PIL import Image

def crop_to_4_5(image_path, output_path):
    with Image.open(image_path) as img:
        width, height = img.size
        # Only crop if it is a square (1:1) image
        if width != height:
            print(f"Skipping {image_path}: already cropped or not 1:1 ({width}x{height})")
            return
            
        # Target aspect ratio is 4:5 (width:height = 0.8)
        # We keep the height and calculate the target width.
        new_width = int(height * 4 / 5)
        # Make new_width even to avoid compression/rendering issues
        if new_width % 2 != 0:
            new_width += 1
            
        left = (width - new_width) // 2
        right = left + new_width
        top = 0
        bottom = height
        
        cropped_img = img.crop((left, top, right, bottom))
        
        # Save the cropped image in-place
        cropped_img.save(output_path, quality=95)
        print(f"Cropped {image_path} ({width}x{height}) -> {output_path} ({cropped_img.size})")

def main():
    ep_dir = "ep01"
    for i in range(1, 11):
        filename = f"{i:02d}.png"
        path = os.path.join(ep_dir, filename)
        if os.path.exists(path):
            crop_to_4_5(path, path)

if __name__ == "__main__":
    main()
