import os
from PIL import Image
import numpy as np
import numpy as np
import os
import concurrent.futures
import pydicom
import numpy as np

def min_max_scaling(image):
    # Min-max scaling to scale pixel values between 0 and 255
    min_val = np.min(image)
    max_val = np.max(image)
    scaled_image = ((image - min_val) / (max_val - min_val)) * 255
    return scaled_image.astype(np.uint8)


def apply_windowing(image, window_center, window_width):
    # Apply windowing function
    window_min = window_center - window_width / 2
    window_max = window_center + window_width / 2
    windowed_image = np.clip(image, window_min, window_max)
    return windowed_image


def convert_dicom_to_png1(dicom_file):
    try:
        ds = pydicom.dcmread(dicom_file)
        image = ds.pixel_array

        if 'WindowCenter' in ds and 'WindowWidth' in ds:
            window_center = ds.WindowCenter
            window_width = ds.WindowWidth
            image = apply_windowing(image, window_center, window_width)

        scaled_image = min_max_scaling(image)
        png_image = Image.fromarray(scaled_image)

        png_file = '/home/vision/Downloads/dicom-images' + dicom_file.split("/")[-1][:-3]+"png"
        png_image.save(png_file)

    except Exception as e:
        print(f"Error converting {dicom_file}: {e}")


def convert_dicom_to_png(display_sets):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.map(convert_dicom_to_png1, display_sets)
