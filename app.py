from flask import Flask, render_template, request, jsonify
import urllib
import json

app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')


@app.route('/process', methods=['POST'])
def process():
    return jsonify(request.form)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
