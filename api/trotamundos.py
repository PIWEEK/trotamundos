from flask import Flask, request, jsonify, render_template
import base64
import io
import imghdr
import mimetypes
import re
import json
from datetime import datetime

app = Flask(__name__)



# Set the maximum content length to 10 MB (for example)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB in bytes

months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

def transform_to_spanish_date(date1, date2):
    # Convert the date string to a datetime object
    date_obj1 = datetime.strptime(date1, '%Y-%m-%d')

    # Get day, month, and year
    day1 = date_obj1.day
    month1 = months[date_obj1.month - 1]
    year1 = date_obj1.year

    spanish_date = ""

    if date2 is None or date2 == "":
        spanish_date = f"{day1} de {month1} de {year1}"
    else:
        date_obj2 = datetime.strptime(date2, '%Y-%m-%d')
        day2 = date_obj2.day
        month2 = months[date_obj2.month]
        year2 = date_obj2.year

        if year1 == year2:
            if month1 == month2:
                spanish_date = f"del {day1} al {day2} de {month1} de {year1}"
            else:
                spanish_date = f"del {day1} de {month1} al {day2} de {month2} de {year2}"
        else:
            spanish_date = f"del {day1} de {month1} de {year1} al {day2} de {month2} de {year2}"

    return spanish_date

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
        'sections': sorted(trip['sections'].values(), key=lambda x: x['pos'])
    }
    html = render_template('post.html', **dynamic_data)
    with open('blog/post/' + trip['id'] +'.html', 'w', encoding='iso-8859-15') as f:
        f.write(html)

def generate_blog(data):
    trips = sorted(data.values(), key=lambda x: x['date'], reverse=True)
    for trip in trips:
        d = transform_to_spanish_date(trip['date'], trip['date2'])
        trip['date'] = d
        generate_post(trip)

    generate_blog_index(trips)


def secure_filename(filename):
    return re.sub(r'[^\w\.-]', '_', filename.strip())

def save_trips(data):
    with open('data/trotamundos.json', 'w') as file:
        json.dump(data, file)

def read_trips():
    try:
        with open('data/trotamundos.json', 'r') as file:
            data = json.load(file)
        return data
    except (FileNotFoundError, json.JSONDecodeError):
        # Return an empty JSON dictionary if the file doesn't exist or is empty
        return {}


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
        new_trips =  json.loads(data)
        trips = read_trips()
        trips.update(new_trips)
        save_trips(trips)
        generate_blog(trips)
        return jsonify({"message": "Trips saved successfully"}), 200
    else:
        return jsonify({"error": "No data in the request."}), 400


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8081)
