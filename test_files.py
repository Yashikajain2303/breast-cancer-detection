import os
import time
import pycuda.driver as cuda
import pycuda.autoinit
import numpy as np
import tensorrt as trt
from PIL import Image, ImageDraw
from focalnet import FocalNet  # Assuming `focalnet.py` defines FocalNet class

def test_files(model, folder_path, save_path, threshold=0.3213213213):
    os.makedirs(save_path, exist_ok=True)
    images = os.listdir(folder_path)
    for i, image in enumerate(images):

        image_path = os.path.join(folder_path, image)
        target_path = os.path.join(save_path, image)

        output, image_array = focalNet.infer_one_image(image_path)

        select_mask = output['scores'] > threshold
        pred_boxes = output['boxes'][select_mask]

        draw = ImageDraw.Draw(image_array)
        for j, box in enumerate(pred_boxes):
            bbox = ((box[0], box[1]), (box[2], box[3]))
            draw.rectangle(bbox, outline="red", width=10)

        image_array.save(target_path)
