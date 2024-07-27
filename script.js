'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDuration = document.querySelector('.form__input--duration');
const inputDistance = document.querySelector('.form__input--distance');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Geolocation API
// first call back is what happpens when browser succesfukky gets the coordinates of the user, second one is when there is an error

let map, mapEvent;

// Project Architecture
class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition(); // app._getPosition;

    // Clear input fields
    form.addEventListener('submit', this._newWorkout.bind(this)); // we have to set 'this' manually, or it will point to form element

    // 'change' is fired when user changes the elements value
    inputType.addEventListener('change', function () {
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });
  }

  _getPosition() {
    // checking if geolocation exists
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your location');
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    const { longitude, latitude } = position.coords;
    // console.log(latitude, longitude);

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    // const map = L.map('map').setView([51.505, -0.09], 13); // default, pointing to london
    this.#map = L.map('map').setView(coords, 15.2); // second value (13) shows how zoomd out it is
    console.log(this);

    // openstreetmap is the open-source map that we will use, you can also use google maps etc.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  _showForm() {
    // When map is clicked
    // 'on' is add event listener equivalent from the leaflet library
    this.#map.on('click', function (mapE) {
      this.#mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  _toggleElevationField() {}

  _newWorkout(e) {
    e.preventDefault();

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // DISPLAY MARKER
    console.log(mapEvent);
    const { lat, lng } = mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App(); // 'app' doesent need any parameter
// app._getPosition; // instead write this in constructor, constructor gets called as the page gets load

console.log(map);
console.log(mapEvent);
