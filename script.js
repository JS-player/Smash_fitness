'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//getting user location
let lat;
let lng;
let type;
class Workout{

    date = new Date();
    id = (Math.random()*5591*Math.random() + '').replace('.', '');

    constructor(coords , distance , duration){
        this.coords = coords; // [lat , lng]
        this.distance = distance; //in km
        this.duration= duration;  //im min

    }

    setInformation(){
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
this.descripton = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}, ${this.date.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
}`;
this.popupDescripton = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
type = 'running';
constructor (coords , distance , duration, cadence){
    super(coords , distance , duration);
    this.cadence = cadence;
    this.calcPace();
    this.setInformation();
}
calcPace(){
this.pace =  this.duration / this.distance;
}
}
class Cycling extends Workout{
type = 'cycling';
constructor (coords , distance , duration, gain){
    super(coords , distance , duration);
    this.gain= gain;
    this.clacSpeed();
    this.setInformation();
}

clacSpeed(){
    this.speed = this.distance / (this.duration / 60) ;
}
}


class App {
    #map = L.map('map'); 
    #mapE ;
    #zoomLevel = 13;
    constructor(){
        this.Workouts = [];
this._getPosition(); // getting location and loading map;
form.addEventListener('submit', this._newWorkout.bind(this)); //adding new workout
this._toggleWorkout();
containerWorkouts.addEventListener("click",this.moveToMarker.bind(this));
this.getWorkouts();

    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
            alert("Sorry we could not get your current location!")
        });
    }

    _loadMap(pos){
        const { latitude } = pos.coords;
        const { longitude } = pos.coords;
        const mapLink = `https://www.google.com.eg/maps/@${latitude},${longitude},10z`
        // const coordsArr = [latitude, longitude];
         const coordsArr = [30.0480683,31.2447691];
        //Displaying map 
        this.#map.setView(coordsArr, this.#zoomLevel + 2); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        // ==========rednder saved marks===============
        this.Workouts.forEach((workout)=>{
            L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
                maxWidth: 200,
                minWidth: 10,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
        
            })).setPopupContent(`${workout.type ==='running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.popupDescripton}`).openPopup();
            });
        // ==============================
        // current location circle
         L.circle(coordsArr, {
            color: 'transparent',
            fillColor: '#f03',
            fillOpacity: 0.4,
            radius: 200
        }).addTo(this.#map);
        // courent  location pin marker
         L.marker(coordsArr).addTo(this.#map)
         .bindPopup('Current location');
// show input form when user clicks on the map
        this.#map.on("click", this._showForm.bind(this))
    }

    _showForm(position){
        this.#mapE = position;
        lat = position.latlng.lat;
        lng = position.latlng.lng;       
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    //hide form after adding new workout
    hideForm(){
        inputCadence.value = inputDistance.value = inputDuration.value = ''; //clearing inputs
        form.style.display = 'none'; 
        form.classList.add('hidden');
        setTimeout(()=>{form.style.display = 'grid';},1000) 

    }

    _toggleWorkout(){
// changeing workout type
inputType.addEventListener("change",()=>{
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
})
    }

    _newWorkout(e){
        e.preventDefault(); //prevent refreshing
        // New Data
        type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        // checking type

        if (type === 'running'){
         const cadence = +inputCadence.value;
        //  Making sure that inputs are vaild 
         if(!Number.isFinite(distance) ||
         !Number.isFinite(cadence) ||
         !Number.isFinite(duration) ||
         distance <= 0 || cadence <= 0 || duration <= 0
          ){
             return alert("Inputs have to be positive numbers!")
         }
         const running = new Running([lat, lng],distance, duration, cadence); // creating new object
         this.Workouts.push(running); //adding that object to workouts array

        }else{  //user has selected cycling
              const elevation = +inputElevation.value;
         //  Making sure that inputs are vaild 
         if(!Number.isFinite(distance) ||
         !Number.isFinite(elevation) ||
         !Number.isFinite(duration) ||
         distance <= 0 || elevation <= 0 || duration <= 0
          ){
             return alert("Inputs have to be positive numbers!")
         }
         const cycling = new Cycling([lat, lng],distance, duration, elevation); // creating new object
         this.Workouts.push(cycling); //adding that object to workouts array

        }
        const currentWorkout = this.Workouts[this.Workouts.length -1]
        //if curser clicked coords render workouut
        this.renderWorkoutMark(currentWorkout);

        // rendring rist
        this.renderWorkout(currentWorkout)
        //clearing old value
       this.hideForm();
       //saving data
       this._setLocalStorage();
       
    }

    renderWorkoutMark(currentWorkout){
       let clickedCoords = [lat, lng];  
       L.marker(clickedCoords).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 200,
            minWidth: 10,
            autoClose: false,
            closeOnClick: false,
            className: `${currentWorkout.type}-popup`,
    
        })).setPopupContent(`${currentWorkout.type ==='running' ? '🏃‍♂️' : '🚴‍♀️'} ${currentWorkout.popupDescripton}`).openPopup();
        
    }
    // Rending Workout list
    renderWorkout(currentWorkout){
let html = `
<li class="workout workout--${currentWorkout.type}" data-id="${currentWorkout.id}">
<div class="close" >x</div>
<h2 class="workout__title">${currentWorkout.descripton}</h2>
<div class="workout__details">
    <span class="workout__icon">${
        currentWorkout.type ==='running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
    <span class="workout__value">${currentWorkout.distance}</span>
    <span class="workout__unit">km</span>
</div>
<div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${currentWorkout.duration}</span>
    <span class="workout__unit">min</span>
</div>
`
if(currentWorkout.type === 'running'){
    html += `
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${currentWorkout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${currentWorkout.cadence}</span>
    <span class="workout__unit">spm</span>
</div>
</li> 
    `
}else{
    html+= `
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${currentWorkout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${currentWorkout.gain}</span>
    <span class="workout__unit">m</span>
</div>
</li>
    `
}
form.insertAdjacentHTML('afterEnd', html) //inserting new li elemnt after the input form
const closeWorkout = document.querySelector('.close');
// delete workout on click
closeWorkout.addEventListener("click",this.deleteWorkout.bind(this));

    }


moveToMarker(e){
const workoutEl = e.target.closest('.workout');
if (!workoutEl) return;

const clickedWorkoutObject = this.Workouts.find(
    work => work.id === workoutEl.dataset.id
)
if(!clickedWorkoutObject) return;
this.#map.setView(clickedWorkoutObject.coords,this.#zoomLevel +3, {
    animate: true,
    pan:{
        duration:1,
    }

} )

    
} 

_setLocalStorage(){
localStorage.setItem('workouts', JSON.stringify(this.Workouts));
}
getWorkouts(){
const data = JSON.parse(localStorage.getItem('workouts'));
if(!data) return;
this.Workouts = data;
this.Workouts.forEach((workout)=>{
//showing saved form
this.renderWorkout(workout);
});
}

deleteWorkout(e){
 const selectedItem = e.target.closest('.workout');
 
 const workoutObjectIndex = this.Workouts.findIndex( //getting clicked workout index
    work => work.id === selectedItem.dataset.id
);
this.Workouts.splice(workoutObjectIndex,1);  //removing that object using its index
// const savedData = JSON.parse(localStorage.getItem('workouts')); //local storage of workouts
// const casheIndex = savedData.findIndex(  //getting index of selected object from cashe
//     work => work.id === selectedItem.dataset.id
// );
// savedData.splice(casheIndex); //removing that item from cash
localStorage.setItem('workouts', JSON.stringify(this.Workouts)) //setting cashe again
selectedItem.style.display = 'none';
location.reload();


}

reset(){  //reseting data
    localStorage.removeItem('workouts');
    location.reload();
}
}

const app = new App();

