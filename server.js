const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const client = axios.create({
  headers: { 'Authorization': 'Bearer ' + process.env.openai }
});


const app = express();
const port = 3000;
app.use(cors());
app.get('/process', async (req, res) => {
  
  const { apiKey, audienceInfo, name, list } = req.query;
  const client2 = axios.create({
    headers: { 'X-Rephonic-Auth': apiKey }
  });
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', "single-process", "--no-zygote"],
    executablePath:
    process.env.NODE_ENV === "production"
    ? process.env.PUPPETEER_EXECUTABLE_PATH
    :puppeteer.executablePath(),
  });  const page = await browser.newPage();

  // Intercept network requests
  await page.setRequestInterception(true);

  // Listen for requests and log URLs
  page.on('request', (request) => {
    const url = request.url();
    if (url.endsWith('.json')) {
      console.log('Request URL:', url);
      fetch(url, {
        method: 'GET',
      })
        .then(response => response.json())
        .then(data => {

          desc = data.pageProps.rawPodcast.description
          console.log(desc);
        })
    }
    request.continue();
  });

  // Navigate to a website (using a placeholder URL)
  await page.goto(`https://rephonic.com/podcasts/${name}`);

  // Perform other actions on the page if needed

  // Close the browser
  await browser.close();

const params = {
  "model": "gpt-3.5-turbo-16k",
  "messages": [
    {
        "role": "user",
        "content": `
        preferred audience: 

        ${audienceInfo}
        ------------
        Say yes if the podcast description below fits with the preferred audience above:
        
        ${desc}
        `
    }
]
}

response = client.post('https://api.openai.com/v1/chat/completions', params)
.then(result => {
  console.log(result.data.choices[0].message.content);
  c = result.data.choices[0].message.content
  if (c.toLowerCase().includes('yes') === true){
    console.log("yes")
    reph(c)
  }
  else{
    console.log("no")
    res.send("no");
  }

}).catch(err => {
  console.log("error:");
console.log(err);
});


function reph(c){
  const params = {
    "podcast_id": name
  
  }
  response = client2.post(`https://api.rephonic.com/api/lists/${list}/podcasts/`, params)
.then(result => {
  c = "added"
  res.send({ c });

}).catch(err => {
  console.log("error:");
console.log(err);
});

}

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});