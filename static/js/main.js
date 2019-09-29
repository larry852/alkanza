var map, circle, currentLatLng, request;
var medicalCenters = [];
var markers = [];

function initMap() {
    map = new google.maps.Map($("#map")[0], {
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
    });
    disabledSubmit();
    getCurrentPosition();
    map.addListener('click', function (e) {
        currentLatLng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
        refreshMap();
    });
}

function getCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            refreshMap();
        });
    } else {
        console.log('Geolocation is not supported by this browser.');
        currentLatLng = new google.maps.LatLng({ lat: 4.624335, lng: -74.063644 });
        refreshMap();
    }
}

function createMarker(place) {
    var infoWindow = new google.maps.InfoWindow;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
    markers.push(marker);
}

function createCircle() {
    circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: currentLatLng,
        radius: getRadius()
    });
}

function searchMedicalCenters() {
    var request = {
        location: currentLatLng,
        radius: getRadius(),
        query: 'medical center'
    };
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, processResults);
}

function processResults(results, status, pagination) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (pagination.hasNextPage) {
            pagination.nextPage();
        }
        results.forEach(function (place) {
            var distance = calculateDistance(place.geometry.location);
            if (distance < getRadius()) {
                createMarker(place);
                medicalCenters.push(place);
            }
        });
        if (!pagination.hasNextPage) {
            buildRequest();
        }
    }
}

function refreshMap() {
    disabledSubmit();
    map.setCenter(currentLatLng);
    if (circle) circle.setMap(null);
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    medicalCenters = [];
    searchMedicalCenters();
    createCircle();
}

function getRadius() {
    return parseInt($("#radius").val());
}

function buildRequest() {
    var medical_centers = medicalCenters.map((val, index, arr) => {
        var location = new Object();
        location.latitude = val.geometry.location.lat();
        location.longitude = val.geometry.location.lng();
        var medical_center = new Object();
        medical_center.location = location;
        medical_center.distance = calculateDistance(val.geometry.location);
        medical_center.name = val.name;
        medical_center.balanced = Math.random() >= 0.5;
        return medical_center;
    });
    var user_location = new Object();
    user_location.latitude = currentLatLng.lat();
    user_location.longitude = currentLatLng.lng();
    request = new Object();
    request.user_location = user_location;
    request.medical_centers = medical_centers;
    request.radius = getRadius();
    enableSubmit();
}

function calculateDistance(location) {
    var distance = google.maps.geometry.spherical.computeDistanceBetween(location, currentLatLng);
    return distance;
}

function disabledSubmit() {
    $("#process").attr("disabled", "disabled");
}

function enableSubmit() {
    $("#process").removeAttr("disabled");
}

$("#process").click(function () {
    post = $.ajax({
        url: '/process',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        type: 'POST',
        data: JSON.stringify(request),
    });
    post.done(function (response, textStatus, jqXHR) {
        resultsMedicalCenters(response);
        resultsGeneral(response);
        $('#title-results').text('Analysis result');
        document.getElementById('result-table').scrollIntoView();
    });
});

function resultsMedicalCenters(results) {
    var container = $('#result-table-medical-centers');
    container.html('');
    table = $('<table class="table table-bordered"><thead class="thead-dark"><tr><th>Medical center</th><th>Distance</th><th>Balanced</th></tr></thead>');
    results.medical_centers.forEach(function (result) {
        var tr = $('<tr>');
        tr.append('<td>' + result['name'] + '</td>');
        tr.append('<td>' + result['distance'].toFixed(2) + ' meters</td>');
        tr.append('<td>' + (result['balanced'] ? 'Yes' : 'No') + '</td>');
        table.append(tr);
    });
    container.append(table);
}

function resultsGeneral(results) {
    var container = $('#result-table');
    container.html('');
    table = $('<table class="table table-bordered"><thead class="thead-dark"><tr><th>Search radius</th><th>Current position</th><th>Distance imbalance</th></tr></thead>');
    var tr = $('<tr>');
    tr.append('<td>' + results['radius'] + '</td>');
    tr.append('<td> Latitude ' + results['user_location']['latitude'] + '<br> Longitude ' + results['user_location']['longitude'] + '</td>');
    tr.append('<td><b>' + results['calculate'] + '</b></td>');
    table.append(tr);
    container.append(table);
}