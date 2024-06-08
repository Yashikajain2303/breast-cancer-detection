
const url = 'http://localhost:3000/metadata';
const headers = {
  'Accept': ''
};

// Make the request with custom headers
fetch(url, {
  method: 'POST',
  headers: headers
})
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
