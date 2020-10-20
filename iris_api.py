import os
import sys

# Flask
from flask import Flask, redirect, url_for, request, render_template, Response, jsonify, redirect
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIServer

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.layers import Input
from keras.models import Model
from keras.models import load_model

# Some utilites
import numpy as np
# from util import base64_to_pil
np.random.seed(2017)

from PIL import Image
import time

import requests
from io import BytesIO

# Declare a flask app
app = Flask(__name__) #framework to create apis

# Model saved with Keras model.save()
MODEL_PATH = 'F:/Automatic-Diabetic-Retinopathy-Detection-master/healthcare/healthcare_resnet50_30_1.h5'

# Load your own trained model
model = load_model(MODEL_PATH)
# model._make_predict_function()          # Necessary
print('Model loaded. Start serving...')

def model_predict(img, model):
    img = img.resize((224, 224))

    # Preprocessing the image
    x = image.img_to_array(img)
    
    # x = np.true_divide(x, 255)
    x = np.expand_dims(x, axis=0) #preprocess

    # Be careful how your trained model deals with the input
    # otherwise, it won't make correct prediction!
    x = preprocess_input(x)

    preds = model.predict(x) #0,1,2,3,4 - 
    preds = np.argmax(preds)
    return preds #numpy array to feed to model.


app = Flask(__name__)

def getImagefromUrl(url):
    res = requests.get(url)
    return Image.open(BytesIO(res.content))

@app.route('/api/', methods=["POST"]) 
def main_interface():
    response = request.get_json() #{imgurl : 'http://firebase-return-url}
    url = response['imgurl'] #'http://firebase-return-url -> stored imaage

    img = None
    img = getImagefromUrl(url) #jpeg image -> numpy array
    pred_class = model_predict(img, model) #0,1,2,3,4
    class_dict = {0:'No DR',1: 'Mild',2 : 'Moderate',3:'Severe',4: 'Proliferative DR'} 
    result = class_dict[pred_class] 

    print(response)
    return result

    
@app.after_request
def add_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response
    
if __name__ == '__main__':
    # app.run(port=5002, threaded=False)

    # Serve the app with gevent
    http_server = WSGIServer(('0.0.0.0', 4000), app)
    http_server.serve_forever()
