from flask import Flask, request, jsonify
import urllib.parse
from flask_cors import CORS
from requests.auth import HTTPBasicAuth
import requests

app = Flask(__name__)
CORS(app)

@app.route('/lookup', methods=['POST'])
def lookup():
    dicom_id = request.form.get('data')
    print(dicom_id, 'dicom_id')
    response = requests.post(
        'http://localhost:8042/tools/lookup',
        data=dicom_id,
        auth=HTTPBasicAuth('orthanc', 'orthanc')
    )
    print(response, 'response')
    return response.json()

@app.route('/update_labels', methods=['PUT', 'OPTIONS'])
def update_labels():
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        headers = {
            'Access-Control-Allow-Methods': 'PUT',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
        return '', 204, headers

    # Handle PUT request to update labels
    try:
        # Access data from request body (assuming JSON)
        data = request.get_json()
        print(data, 'data data data')
        instance_id = data['instance_id']
        new_label = data['new_label']
        print(instance_id, 'instance_id data')
        print(new_label, 'new_label data')
        if not instance_id or not new_label:
            return jsonify({'error': 'Missing instance_id or new_label'}), 400

        # Construct the URL for the PUT request to the Orthanc server
        encoded_label = urllib.parse.quote(new_label, safe='')
        url = f'http://localhost:8042/instances/{instance_id}/labels/{encoded_label}'

        # Set headers as needed, example:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # Make the PUT request to Orthanc server
        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()  # Raise an error for bad HTTP status codes

        return jsonify({'message': 'Labels updated successfully'}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        headers = {
            'Access-Control-Allow-Methods': 'PUT',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',  # 24 hours
        }
        return '', 204, headers

    # Handle PUT request to update labels
    instance_id = request.args.get('instance_id')
    new_label = request.args.get('new_label')
    print(instance_id, 'instance_id')
    print(new_label, 'new_label')
    if not instance_id or not new_label:
        return jsonify({'error': 'Missing instance_id or new_label'}), 400

    try:
        # Replace with your logic to update labels in Orthanc server
        # Construct the URL for the PUT request to the Orthanc server
        url = f'http://localhost:8042/instances/{instance_id}/labels/{new_label}'

        # Set headers as needed, example:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # Make the PUT request to Orthanc server
        response = requests.put(url, headers=headers)
        response.raise_for_status()  # Raise an error for bad HTTP status codes

        return jsonify({'message': 'Labels updated successfully'}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/instances', methods=['GET'])
def get_instances():
    # URL of the Orthanc server
    orthanc_url = 'http://localhost:8042/instances?expand=true'

    # Make a request to the Orthanc server
    response = requests.get(orthanc_url)
    print('response',response)
    # Return the response from Orthanc as JSON
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
