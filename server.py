from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import joblib

# === Initialize Flask app ===
app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# === Load your trained model and label encoder ===
model = load_model('model.h5')
label_encoder = joblib.load('label_encoder.pkl')

# === Prediction route ===
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Load and preprocess the image
        img = Image.open(file.stream).resize((100, 100))
        img = np.array(img).astype('float32') / 255.0

        if img.shape != (100, 100, 3):
            return jsonify({'error': 'Invalid image shape'}), 400

        img = np.expand_dims(img, axis=0)

        # Predict
        prediction = model.predict(img)
        predicted_class = np.argmax(prediction, axis=1)
        class_label = label_encoder.inverse_transform(predicted_class)[0]

        return jsonify({'prediction': class_label})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === Main execution ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
