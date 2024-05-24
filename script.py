from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from PIL import Image
import numpy as np

app = Flask(__name__)
cors = CORS(app)

def min_max_scaling(image):
    min_val = np.min(image)
    max_val = np.max(image)
    scaled_image = ((image - min_val) / (max_val - min_val)) * 255
    return scaled_image.astype(np.uint8)

def apply_windowing(image, window_center, window_width):
    window_min = window_center - window_width / 2
    window_max = window_center + window_width / 2
    windowed_image = np.clip(image, window_min, window_max)
    return windowed_image

def convert_dicom_to_png(pixel_array, window_center, window_width, output_file):
    try:
        image = pixel_array
        if window_center is not None and window_width is not None:
            image = apply_windowing(image, window_center, window_width)

        scaled_image = min_max_scaling(image)
        png_image = Image.fromarray(scaled_image)

        png_image.save(output_file)
        return f"Saved PNG image to {output_file}"
    except Exception as e:
        return f"Error converting to PNG: {e}"

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        print(data, data['pixel_array'], 'pixel data')
        pixel_array = np.array(data['pixel_array'])
        window_center = data['window_center']
        window_width = data['window_width']
        output_file = 'output.png'  # Specify the output file path

        result = convert_dicom_to_png(pixel_array, window_center, window_width, output_file)
        return jsonify({'message': result, 'output_file': output_file})
    except Exception as e:
        return jsonify({'message': f"Error processing request: {e}", 'output_file': ''})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
