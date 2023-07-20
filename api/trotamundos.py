from flask import Flask, request, jsonify

app = Flask(__name__)

def save_trips(filename, data):
    with open('data/trotamundos.json', 'wt') as f:
        f.write(data)

@app.route('/publish', methods=['POST'])
def publish():
    data = request.form.get('data')
    if data:
        save_trips(data)
        return jsonify({"message": "Trips saved successfully"}), 200
    else:
        return jsonify({"error": "No data in the request."}), 400


@app.route('/upload', methods=['POST'])
def upload_image():
    data = request.form.get('data')
    if data:
        save_image(data)
        return jsonify({"message": "Image saved successfully."}), 200
    else:
        return jsonify({"error": "No data in the request."}), 400

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8081)
