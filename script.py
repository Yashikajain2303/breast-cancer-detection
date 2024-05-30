from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from conversion import convert_dicom_to_png

app = Flask(__name__)
cors = CORS(app)

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        display_sets = data['displaySets']

        result = convert_dicom_to_png(display_sets)
        output_file = '/home/vision/Downloads/output_file/output.png'
        return jsonify({'message': result, 'output_file': output_file})
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'message': f"Error processing request: {e}", 'output_file': ''})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
