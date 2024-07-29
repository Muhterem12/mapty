'use strict';

// Comment without 'Better Comments' extension
// ! Alert
// *Highlighted Comment
// TODO Improve this
// ? Query
//// comment that is commented out

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDuration = document.querySelector('.form__input--duration');
const inputDistance = document.querySelector('.form__input--distance');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Geolocation API
// first call back is what happpens when browser succesfukky gets the coordinates of the user, second one is when there is an error

// ! PARENT WORKOUT CLASS
class Workout {
  date = new Date();
  id = (Date.now() + ' ').slice(-10);

  constructor(coords, distance, duration) {
    this.distance = distance; // in km
    this.coords = coords; // [lattitude, longitude]
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // prettier-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}
// ! RUNNING CLASS
class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); // calling the pace

    this._setDescription();
  }
  calcPace() {
    // min / km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// ! CYCLING CLASS
class Cycling extends Workout {
  type = 'cycling'; // this will be available on all instances

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    // this.type = cycling;

    this._setDescription();
  }
  calcSpeed() {
    // km/h

    this.speed = this.distance / (this.duration / 60); // duration is in hours therefore we divide it to 60zz
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178); // next we have the diastabce
const cycling1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycling1);

// ! //////////////////////////////////
// ! PROJECT ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition(); // app._getPosition;

    // Clear input fields
    form.addEventListener('submit', this._newWorkout.bind(this)); // we have to set 'this' manually, or it will point to form element

    inputType.addEventListener('change', this._toggleElevationField);
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
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    // const map = L.map('map').setView([51.505, -0.09], 13); // default, pointing to london

    this.#map = L.map('map').setView(coords, 15.2); // second value (13) shows how zoomd out it is
    console.log(this);
    // openstreetmap is the open-source map that we will use, you can also use google maps etc.

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    // When map is clicked

    // 'on' is add event listener equivalent from the leaflet library
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid')), 100;
  }

  _toggleElevationField() {
    // 'change' is fired when user changes the elements value

    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // every method will return true if its true in all of them
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // TODO Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // TODO If activity is running create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // TODO Check if data is valid
      if (
        // // !Number.isFinite(distance) ||
        // // !Number.isFinite(duration) ||
        // // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) &&
        allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // TODO If activity is cycling create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // TODO Check if data is valid
      if (
        // // !Number.isFinite(distance) ||
        // // !Number.isFinite(duration) ||
        // // !Number.isFinite(cadence)
        !validInputs(distance, duration, elevation) &&
        allPositive(distance, duration, elevation)
      )
        return alert('Input have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);

      // console.log(workout);
    }

    // TODO Add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    // TODO render workout on map as marker
    this._renderWorkoutMarker(workout); // calling it as function of the object, this keyword in that method will be current object

    // TODO render workout on the list
    this._renderWorkout(workout);

    // TODO Clear input fields + Hide the form
    // prettier-ignore
    this._hideForm()
  }

  _renderWorkoutMarker(workout) {
    // ! open popup
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  // ! render workout
  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2> 
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    // ! html when running
    // toFixed(1) is for rounding the numbert to 1 decimal place
    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span> 
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;
    }

    // ! html when cycling
    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span> 
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
    }

    // ! inserting it as sibling element to form
    form.insertAdjacentHTML('afterend', html);
  }
}
const app = new App(); // 'app' doesent need any parameter

//
// app._getPosition; // instead write this in constructor, constructor gets called as the page gets load

// console.log(map);
// console.log(mapEvent);

// L.marker(workout.coords)
//   .addTo(this.#map)
//   .bindPopup(
//     L.popup({
//       maxWidth: 250,
//       minWidth: 100,
//       autoClose: false,
//       closeOnClick: false,
//       className: `${workout.type}-popup`,
//     })
//   )
//   .setPopupContent(
//     `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
//   )
//   .openPopup();
