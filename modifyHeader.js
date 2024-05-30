const url = 'http://localhost:3000/dicom-web/studies';
const headers = {
  'Accept': ''
};

// Make the request with custom headers
fetch(url, {
  method: 'GET',
  headers: headers
})
  .then(response => response.text())
  .then(data => console.log(data, 'i am new data'))
  .catch(error => console.error('Error:', error));
