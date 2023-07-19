from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/print', methods=['POST'])
def print_string():
    data = request.form.get('data')
    if data:
        print(data)
        return jsonify({"message": "String printed successfully."}), 200
    else:
        return jsonify({"error": "No data in the request."}), 400

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8081)
