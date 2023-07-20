from flask import Flask, request, jsonify, render_template
import base64
import io
import imghdr
import mimetypes
import re
import json

app = Flask(__name__)

# Set the maximum content length to 10 MB (for example)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB in bytes

def generate_blog_index(trips):
    dynamic_data = {
        'trips': trips
    }
    html = render_template('index.html', **dynamic_data)
    with open('blog/index.html', 'w', encoding='iso-8859-15') as f:
        f.write(html)

def generate_post(trip):
    dynamic_data = {
        'name': trip['name'],
        'date': trip['date'],
        'date2': trip['date2'],
        'sections': sorted(trip['sections'].values(), key=lambda x: x['pos'])
    }
    html = render_template('post.html', **dynamic_data)
    with open('blog/post/' + trip['id'] +'.html', 'w', encoding='iso-8859-15') as f:
        f.write(html)

def generate_blog(data):
    trips = json.loads(data).values()
    generate_blog_index(trips)
    for trip in trips:
        generate_post(trip)




def secure_filename(filename):
    return re.sub(r'[^\w\.-]', '_', filename.strip())

def save_trips(data):
    with open('data/trotamundos.json', 'wt') as f:
        f.write(data)


def save_image(filename, data):
    filename = "data/images/" + secure_filename(filename)
    with open(filename, 'wb') as f:
        f.write(data)
    return filename

def get_extension(image_data):
    try:
        mime_type = image_data.split(";")[0].split(":")[1]
        extension = mimetypes.guess_extension(mime_type)
        return extension
    except Exception as e:
        print("Error while getting MIME type:", e)
        return None


@app.route('/save_image', methods=['POST'])
def save_base64_image():
    image_data = request.form.get('image_data')
    image_id = request.form.get('image_id')
    if image_data and image_id:
        try:
            decoded_data = base64.b64decode(image_data.split(",")[1])
            #file_name = image_id + get_extension(image_data)
            file_name = save_image(image_id, decoded_data)
            return jsonify({"message": "Image saved successfully.", "filename": file_name}), 200
        except base64.binascii.Error:
            return jsonify({"error": "Invalid base64-encoded image data."}), 401
    else:
        return jsonify({"error": "No image data in the request."}), 402


@app.route('/publish', methods=['POST'])
def publish():
    data = request.form.get('data')
    if data:
        save_trips(data)
        generate_blog(data)
        return jsonify({"message": "Trips saved successfully"}), 200
    else:
        return jsonify({"error": "No data in the request."}), 400


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8081)
