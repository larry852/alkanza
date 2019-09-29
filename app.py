from core.database import db_session
from core.models import Request, Location, MedicalCenter
from core.database import db_session
from flask import Flask, render_template, request, jsonify
import urllib
import json
from core.algorithm import Algorithm
from core.database import init_db

app = Flask(__name__)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')


@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    data['calculate'] = get_calculate(data)
    save_data(data)
    return jsonify(data)


def get_calculate(data):
    algorithm = Algorithm.get_instance()
    distances = [
        medical_center['distance'] for medical_center in data['medical_centers']]
    medical_centers_unbalances = {index for index, value in enumerate(
        data['medical_centers']) if not value['balanced']}
    return algorithm.distance_imbalance(
        distances, medical_centers_unbalances)


def save_data(data):
    init_db()
    request = Request()
    request.distance_imbalance = data['calculate']
    user_location = Location()
    user_location.latitude = data['user_location']['latitude']
    user_location.longitude = data['user_location']['latitude']
    request.location = user_location
    request.radius = data['radius']
    medical_centers = [build_medical_center(
        medical_center, request) for medical_center in data['medical_centers']]
    request.medical_centers = medical_centers
    db_session.add(request)
    db_session.commit()


def build_medical_center(medical_center, request):
    medical_center_model = MedicalCenter()
    medical_center_model.balanced = medical_center['balanced']
    medical_center_model.distance = medical_center['distance']
    location = Location()
    location.latitude = medical_center['location']['latitude']
    location.longitude = medical_center['location']['latitude']
    medical_center_model.location = location
    medical_center_model.name = medical_center['name']
    medical_center_model.request = request
    return medical_center_model


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
