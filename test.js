const url = 'http://localhost:3000/process';
const apiKey = 'b8ea57d3-3ec7-4c9a-875e-1acc55001d3b';
const audienceInfo = 'some-audience-info';
const names = 'optimal-finance-daily';
console.log("a")
const queryParams = new URLSearchParams({
  apiKey: apiKey,
  audienceInfo: "finance",
  name: names,
  list: 'wqds'
});

const requestUrl = `${url}?${queryParams}`;

fetch(requestUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Handle the response data here
    console.log(data);
  })
  .catch(error => {
    // Handle errors here
    console.error('Error:', error);
  });