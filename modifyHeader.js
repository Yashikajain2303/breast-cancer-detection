<<<<<<< Updated upstream
const url = 'http://localhost:3000/dicom-web/studies';
=======
const url = 'http://localhost:3000/metadata';
>>>>>>> Stashed changes
const headers = {
  'Accept': ''
};

// Make the request with custom headers
fetch(url, {
<<<<<<< Updated upstream
  method: 'GET',
  headers: headers
})
  .then(response => response.text())
  .then(data => console.log(data, 'i am new data'))
=======
  method: 'POST',
  headers: headers
})
  .then(response => response.text())
  .then(data => console.log(data))
>>>>>>> Stashed changes
  .catch(error => console.error('Error:', error));
