import * as escompose from './escode/escompose/index.esm.js';
import * as metrics from './escode/components/metrics/index.esm.js';
import navigation from './navigation.js';

let engagement = 0;
let attributes = {
  energy: 5,
  valence: 5,
  speech: 5
};
globalThis.attributes = attributes;

function setSong(newSong) {
  fetch()
}

function getNextSong() {
  fetch("/getnext")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      attributes.valence = data.x;
      attributes.energy = data.y;

      setTimeout(getNextSong, 60*1000);
    })
}

getNextSong();

const connectDeviceEl = document.getElementById('connect-device');
const engagementEl = document.getElementById('engagement');
const engagementPlayhead = document.querySelector('#engagement-bar .playhead');
const engagementValueEl = document.getElementById('engagement-value');


let engagementData = false;

console.log('Metrics Component', metrics)
const component = escompose.create(metrics, {
  __parent: connectDeviceEl,
  __listeners: {
    '': {
      'calculations.engagement': (value) => {
        engagement = engagement* 0.95 + value * 0.05;
        engagementEl.style.display = "block";
        console.log(engagementEl.style.display);
        const percentage = Math.ceil(engagement * 400 - 200) + "%";
        engagementValueEl.innerText = percentage;
        engagementPlayhead.style.width = percentage;
      }
    }
  },
  __attributes: {
    style: {
      position: 'relative'
    }
  }
})


const mainEl = document.getElementById('main-columns');
const leftStartScreenEl = document.getElementById('left-start-screen');
const leftPlayScreenEl = document.getElementById('left-play-screen');
const startButtonEl = document.getElementById('start');
const rightColumnEl = document.getElementById('right-column');

startButtonEl.onclick = function() {
  mainEl.classList.add("play-screen");
  leftStartScreenEl.classList.add("hide");
  leftPlayScreenEl.classList.remove("hide");
  rightColumnEl.classList.remove("hide");
}

export default {attributes, engagement};





// // Updates full webpage based on state.
// function render() {
//   switch (state.screen) {
//     case "start":
      
//       break;
//     case "play":
//       mainEl.classList.add("play-screen");
//       leftStartScreenEl.classList.add("hide");
//       leftPlayScreenEl.classList.remove("hide");
//       break;
//     case "explore":
//       mainEl.classList.add("play-screen");
//       leftStartScreenEl.classList.add("hide");
//       leftPlayScreenEl.classList.remove("hide");
//       break;
//     default:
//       break;
//   }
// }