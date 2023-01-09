import React from "react";
import ReactDOM from "react-dom";

import PersonalKanban from "./PersonalKanban";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import "./index.css";
import {getItem, setItem} from "./PersonalKanban/services/StorageService";
import {getId} from "./PersonalKanban/services/Utils";
import {RecordStatus} from "./PersonalKanban/enums";
function isEqual(object1: any, object2: any) {
    const props1 = Object.getOwnPropertyNames(object1);
    const props2 = Object.getOwnPropertyNames(object2);
  
    if (props1.length !== props2.length) {
      return false;
    }
  
    for (let i = 0; i < props1.length; i += 1) {
      const prop = props1[i];
      const bothAreObjects = typeof(object1[prop]) === 'object' && typeof(object2[prop]) === 'object';
  
      if ((!bothAreObjects && (object1[prop] !== object2[prop]))
      || (bothAreObjects && !isEqual(object1[prop], object2[prop]))) {
        return false;
      }
    }
  
    return true;
}
const data = [
    {
        id: 1,
        name: "Сергей Бабин",
        records:  [
            {
                id: getId(),
                description: "Содержимое 1й карточки Сергея",
                title: "3456",
                status: RecordStatus.Plan,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 1й карточки Сергея",
                title: "3456",
                status: RecordStatus.Progress,
                changedDate: new Date().toLocaleString().split(',').join(''),
                estimated_time: 3,
                start_date: "27.12.2022",
                hours: 0,
                end_date: "28.12.2022"
            },
            {
                id: getId(),
                description: "Содержимое 1й карточки Сергея",
                title: "3456",
                status: RecordStatus.Plan,
                changedDate: new Date().toLocaleString().split(',').join(''),
                estimated_time: 5,
                hours: 0,
                start_date: "27.12.2022",
                end_date: "28.12.2022"
            },
            {
                id: getId(),
                description: "Содержимое 1й карточки Сергея",
                title: "3456",
                status: RecordStatus.Plan,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 1й карточки Сергея",
                title: "3456",
                status: RecordStatus.Progress,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 2й карточки Сергея",
                title: "3466",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 2й карточки Сергея",
                title: "3466",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 3й карточки Сергея",
                title: "3476",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Принести ключ на 8",
                title: "34786",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate: new Date().toLocaleString().split(',').join('')
            },
        ]
    },
    {
        id: 2,
        name: "Александр Голубков",
        records: [

            {
                id: getId(),
                description: "Содержимое 1й карточки Александра",
                title: "3456",
                status: RecordStatus.Plan,
                changedDate: new Date().toLocaleString().split(',').join(''),
                estimated_time: 2,
                start_date: "23.12.2022",
                hours: 0,
                end_date: "24.12.2022"
            },
            {
                id: getId(),
                description: "Содержимое 1й карточки Александра",
                title: "3456",
                status: RecordStatus.Progress,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 2й карточки Александра",
                title: "3466",
                status: RecordStatus.Progress,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 3й карточки Александра",
                title: "3476",
                status: RecordStatus.Progress,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Принести ключ на 8",
                title: "34786",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },

        ]
    },
    {
        id: 3,
        name: "Александр Плаксюк",
        records: [
            {
                id: getId(),
                description: "Содержимое 1й карточки Александра",
                title: "3456",
                status: RecordStatus.Plan,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 2й карточки Александра",
                title: "3466",
                status: RecordStatus.Progress,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {
                id: getId(),
                description: "Содержимое 3й карточки Александра",
                title: "3476",
                status: RecordStatus.Inspection,
                hours: 0,
                changedDate:new Date().toLocaleString().split(',').join('')
            },
            {id: getId(), description: "Принести ключ на 8", title: "34786", hours: 0, status: RecordStatus.Inspection,  changedDate:new Date().toLocaleString().split(',').join('')},

        ]
    }
] 

// 
if(!getItem('user_data')) {
    setItem('user_data', data)
}

ReactDOM.render(
  <React.StrictMode>
    <PersonalKanban />
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorkerRegistration.register();
reportWebVitals();
