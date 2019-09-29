from flask import Flask, render_template, request, jsonify
import urllib
import json
from core.algorithm import Algorithm

app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')


@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    data['calculate'] = get_calculate(data)
    return jsonify(data)


def get_calculate(data):
    algorithm = Algorithm.get_instance()
    distances = [
        medical_center['distance'] for medical_center in data['medical_centers']]
    medical_centers_unbalances = {index for index, value in enumerate(
        data['medical_centers']) if not value['balanced']}
    return algorithm.distance_imbalance(
        distances, medical_centers_unbalances)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
