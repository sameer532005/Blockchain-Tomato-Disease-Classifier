import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical
from PIL import Image
import sys
import joblib

sys.stdout.reconfigure(encoding='utf-8')

# === Load Data ===
def load_data(image_folder):
    images, labels = [], []
    class_names = os.listdir(image_folder)

    print(f"Found {len(class_names)} disease categories in dataset.")

    for label in class_names:
        class_folder = os.path.join(image_folder, label)
        if os.path.isdir(class_folder):
            print(f"Processing images from: {label}")
            for img_name in os.listdir(class_folder):
                img_path = os.path.join(class_folder, img_name)
                try:
                    img = Image.open(img_path).resize((100, 100))
                    img = np.array(img)
                    if img.shape == (100, 100, 3):
                        images.append(img)
                        labels.append(label)
                except Exception as e:
                    print(f"Error loading image {img_name}: {e}")

    print(f"Loaded {len(images)} images.")
    return np.array(images), np.array(labels)

# === Preprocess Data ===
def preprocess_data(images, labels):
    images = images.astype('float32') / 255.0
    label_encoder = LabelEncoder()
    labels_encoded = label_encoder.fit_transform(labels)
    labels_one_hot = to_categorical(labels_encoded)
    return images, labels_one_hot, label_encoder

# === Build CNN Model ===
def build_cnn_model(input_shape, num_classes):
    model = Sequential([
        Input(shape=input_shape),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# === Train Model ===
def train_model(model, X_train, y_train, X_test, y_test, epochs=20, batch_size=32):
    history = model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, validation_data=(X_test, y_test))
    return history

# === Test Model ===
def test_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true_classes = np.argmax(y_test, axis=1)
    accuracy = accuracy_score(y_true_classes, y_pred_classes)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

# === Predict Function (optional) ===
def predict_disease(model, img_path, label_encoder):
    img = Image.open(img_path).resize((100, 100))
    img = np.array(img).astype('float32') / 255.0
    img = np.expand_dims(img, axis=0)
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction, axis=1)
    return label_encoder.inverse_transform(predicted_class)[0]

# === Main Execution Block ===
if __name__ == "__main__":  # ✅ CORRECTED HERE
    image_folder = 'C:/IDP2/tomato/train'  # 🔁 Update path as needed
    images, labels = load_data(image_folder)

    if len(images) == 0:
        print("No images loaded. Please check dataset path.")
    else:
        images, labels_one_hot, label_encoder = preprocess_data(images, labels)
        X_train, X_test, y_train, y_test = train_test_split(images, labels_one_hot, test_size=0.2, random_state=42)

        input_shape = (100, 100, 3)
        num_classes = len(label_encoder.classes_)
        model = build_cnn_model(input_shape, num_classes)

        train_model(model, X_train, y_train, X_test, y_test, epochs=20, batch_size=32)
        test_model(model, X_test, y_test)

        # ✅ Save the model and label encoder
        model.save('model.h5')
        joblib.dump(label_encoder, 'label_encoder.pkl')

        print("✅ Model and label encoder saved successfully!")
