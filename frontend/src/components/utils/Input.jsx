// ../components/utils/Input.js

import React from 'react';

export const Textarea = ({ type, name, id, value, placeholder, onChange }) => (
  <textarea
    type={type}
    name={name}
    id={id}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export const Input = ({ type, name, id, value, onChange }) => (
  <input
    type={type}
    name={name}
    id={id}
    value={value}
    onChange={onChange}
    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export default Input; // Export both components
