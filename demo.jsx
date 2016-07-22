import React from 'react'
import ReactDOM from 'react-dom'
import DatePicker from './src/main.jsx'


ReactDOM.render(React.createElement(DatePicker, {
    minDate: '2015-07-15',
    maaxDate: '2018-01-07',
}), document.getElementById('central'));
