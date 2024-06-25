from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import email
import requests
import json
import matplotlib.pyplot as plt
from pydicom import dcmread, dcmwrite
import io
from models_backend.smallmass.smallmass import SmallMass
from models_backend.densemass.densemass import Densemass
from models_backend.focalnet.focalnet import FocalNet
from models_backend.clinical.clinical import Clinical
from models_backend.multiview.cen import CEN
from models_backend.multiview.cen import create_data_cen, cen_preds
import uuid
import os
import threading
import warnings
from PIL import Image, ImageDraw, ImageFont
import base64
from enum import Enum
Image.MAX_IMAGE_PIXELS = 191501596454363565
TOPK=1
app = Flask(__name__)
CORS(app)
densemass = Densemass()
smallmass = SmallMass("models_backend/smallmass/checkpoints/smallmass_weights_new.trt")
focalnet = FocalNet("models_backend/focalnet/trt_models/focalnet.trt", "FP16", [3, 1330, 800], 1)
clinical = Clinical("models_backend/clinical/checkpoints/model_best.trt")
multiview = CEN("models_backend/multiview/trt_models/CEN.trt", 'FP16', 25)


class ModelType:
    FOCALNET="focalnet"
    CLINICAL="clinical"
    MULTIVIEW="multiview"
    DENSEMASS="densemass"
    SMALLMASS="smallmass"


def plot_results(img, results):
    draw_img = ImageDraw.Draw(img)
    for k, value in results.items():
        if k == "smallmass":
            for element in value:
                x1, y1, x2, y2 = element["x1"], element["y1"], element["x2"], element["y2"]
                draw_img.rectangle(((x1, y1), (x2, y2)), outline="red", width=10)
                draw_img.text((x1, y1-20), "Smallmass Output", "red", font = ImageFont.truetype("font.ttf", 150))
        elif k == "densemass":
            x1, y1, x2, y2 = value["x1"], value["y1"], value["x2"], value["y2"]
            draw_img.rectangle(((x1, y1), (x2, y2)), outline="green", width=10)
            draw_img.text((x1, y1-20), "Densemass Output", "green", font = ImageFont.truetype("font.ttf", 150))
        elif k == "focalnet":
            for element in value:
                x1, y1, x2, y2 = element["x1"], element["y1"], element["x2"], element["y2"]
                draw_img.rectangle(((x1, y1), (x2, y2)), outline="blue", width=10)
                draw_img.text((x1, y1-20), "FocalNet Output", "blue", font = ImageFont.truetype("font.ttf", 150))
        elif k == "clinical":
            draw_img.text((img.width - 500, 20), "Non malignant" if value == 0 else "Malignant", "blue", font = ImageFont.truetype("font.ttf", 150))
    return img


def convert_pixel_array(img, plot=False, plot_multiview=False, results = None):
    img = np.array(img.pixel_array)
    img = ((img - img.min()) / (img.max() - img.min())) * 255.0
    img = Image.fromarray(np.uint8(img)).convert("RGB")
    # if plot:
    #     img = plot_results(img, results)
    buff = io.BytesIO()
    img.save(buff, format="PNG")
    img_str = base64.b64encode(buff.getvalue())
    img_base64 = bytes("data:image/png;base64,", encoding='utf-8') + img_str
    return str(img_base64.decode("utf-8"))


def get_dicom(request_url):
    r = requests.get(request_url)
    r.raise_for_status()
    headers = ''
    for (key, value) in r.headers.items():
        headers += '%s: %s\n' % (key, value)
    s = bytes(headers + '\n', 'ascii') + r.content
    msg = email.message_from_bytes(s)
    for i, part in enumerate(msg.walk(), 1):
        dicom = part.get_payload(decode = True)
        if dicom != None:
            dicom_as_bytesio = io.BytesIO(dicom)
            dicom = dcmread(dicom_as_bytesio)
            print(f"Processed dicom: {request_url}")
            return dicom


def process_study(uid, model=None):
    print(f"Processing sudy: {uid}")
    response = {"message": {}, "error": {}}
    elements = {}
    r1_url = f"http://localhost:8042/dicom-web/studies/{uid}/metadata"
    r2_url = f"http://localhost:8042/dicom-web/studies/{uid}/series/"
    r1 = requests.get(r1_url)
    r1_content = json.loads(r1.content)
    for element in r1_content:
        uri = element["0020000E"]["Value"][0]
        modality = element["0008103E"]["Value"][0]
        elements[modality] = get_dicom(r2_url + uri)
    if len(elements.keys()) != 4:
        response["error"]["is_available"] = True
        response["error"]["message"] = "All views are not available."
    else:
        response["error"]["is_available"] = False
        response["error"]["message"] = ""
    for key, value in elements.items():
        if model == None:
            densemass_result = densemass(value)
            smallmass_result = smallmass(value)
            focalnet_result, _ = focalnet.infer_one_image(value)
            clinical_result = clinical(value, focalnet_result, "screening mammogram bilateral mastalgia x15 yearnon cyclical")
            fc_dino_results = focalnet_result["boxes"].numpy().tolist()[0][:TOPK]
            fc_dino_results = list(map(lambda x: list(map(lambda y: int(y), x)), fc_dino_results))
            response["message"][key] = {
                "smallmass": list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, smallmass_result)),
                "densemass": {x[0]: x[1] for x in list(zip(["x1", "y1", "x2", "y2"], densemass_result))},
                "focalnet": list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, fc_dino_results)),
                "clinical": int(clinical_result),
            }
            img_response = convert_pixel_array(value, True, False, response["message"][key])
            response["message"][key]["img"] = img_response

            if "R MLO" in elements.keys() and "R CC" in elements.keys():
                rmlo_fc_results, rmlo_img = focalnet.infer_one_image(elements["R MLO"], normalized=True, not_to_xyxy=True)
                rcc_fc_results, rcc_img = focalnet.infer_one_image(elements["R CC"], normalized=True, not_to_xyxy=True)

                rmlo_data = create_data_cen(rmlo_img, rmlo_fc_results)
                rcc_data = create_data_cen(rcc_img, rcc_fc_results)
                rmlo_cen_preds, rcc_cen_preds = cen_preds(multiview, rmlo_data, rcc_data, rmlo_img.size, rcc_img.size)
                response["message"]["R MLO"]["multiview"] = list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, rmlo_cen_preds[:TOPK]))
                response["message"]["R CC"]["multiview"] = list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, rcc_cen_preds[:TOPK]))

            if "L MLO" in elements.keys() and "L CC" in elements.keys():
                lmlo_fc_results, lmlo_img = focalnet.infer_one_image(elements["L CC"], normalized=True, not_to_xyxy=True)
                lcc_fc_results, lcc_img = focalnet.infer_one_image(elements["L CC"], normalized=True, not_to_xyxy=True)
                lmlo_data = create_data_cen(lmlo_img, lmlo_fc_results)
                lcc_data = create_data_cen(lcc_img, lcc_fc_results)
                lmlo_cen_preds, lcc_cen_preds = cen_preds(multiview, lmlo_data, lcc_data, lmlo_img.size, lcc_img.size)
                response["message"]["L MLO"]["multiview"] = list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, lmlo_cen_preds[:TOPK]))
                response["message"]["L CC"]["multiview"] = list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, lcc_cen_preds[:TOPK]))

        elif model == ModelType.FOCALNET:
            focalnet_result, _ = focalnet.infer_one_image(value)
            fc_dino_results = focalnet_result["boxes"].numpy().tolist()[0][:TOPK]
            fc_dino_results = list(map(lambda x: list(map(lambda y: int(y), x)), fc_dino_results))
            response["message"][key] = {
                "focalnet": list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, fc_dino_results)),
            }
            img_response = convert_pixel_array(value, True, False, response["message"][key])
            response["message"][key]["img"] = img_response
        elif model == ModelType.DENSEMASS:
            densemass_result = densemass(value)
            response["message"][key] = {
                "densemass": {x[0]: x[1] for x in list(zip(["x1", "y1", "x2", "y2"], densemass_result))},
            }
            img_response = convert_pixel_array(value, True, False, response["message"][key])
            response["message"][key]["img"] = img_response
        elif model == ModelType.SMALLMASS:
            smallmass_result = smallmass(value)
            response["message"][key] = {
                "smallmass": list(map(lambda x: {"x1": x[0], "x2": x[2], "y1": x[1], "y2": x[3]}, smallmass_result)),
            }
            img_response = convert_pixel_array(value, True, False, response["message"][key])
            response["message"][key]["img"] = img_response
        elif model == ModelType.CLINICAL:
            focalnet_result, _ = focalnet.infer_one_image(value)
            clinical_result = clinical(value, focalnet_result, "screening mammogram bilateral mastalgia x15 yearnon cyclical")
            response["message"][key] = {
                "clinical": int(clinical_result),
            }
            img_response = convert_pixel_array(value, True, False, response["message"][key])
            response["message"][key]["img"] = img_response
        elif model == ModelType.MULTIVIEW:
            pass
        else:
            raise NotImplementedError()
    return response

@app.route('/focalnetRun', methods=['POST'])
def focalnetRun():
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid, ModelType.FOCALNET)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response

@app.route('/clinicalRun', methods=['POST'])
def clinicalRun():
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid, ModelType.CLINICAL)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response

@app.route('/smallmassRun', methods=['POST'])
def smallmassRun():
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid, ModelType.SMALLMASS)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response

@app.route('/densemassRun', methods=['POST'])
def densemassRun():
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid, ModelType.DENSEMASS)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response

@app.route('/mutliviewRun', methods=['POST'])
def multiviewRun():
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid, ModelType.MULTIVIEW)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response

@app.route('/convert', methods=['POST'])
def convert():
        print("LOG flask thread: ", threading.get_ident())
    # try:
        data = request.get_json()
        display_sets = data['displaySets']
        uid = display_sets[0]["StudyInstanceUID"]
        response = app.response_class(
            response=json.dumps(process_study(uid)),
            status=200,
            mimetype='application/json'
        )
        print(response)
        return response
    # except Exception as e:
    #     print(f"Error processing request: {e}")
    #     return jsonify({'message': f"Error processing request: {e}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
