const express = require('express');
const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const directoryPath = 'url';
const filePath = path.join(directoryPath, 'url.txt');

const client = axios.create({
  headers: { 'Authorization': 'Bearer ' + process.env.openai }
});

const app = express();
const port = 3000;
app.use(cors());
app.post('/process', async (req, res) => {
  let desc;
  const { apiKey, audienceInfo, name, list } = req.query;
  //const url = process.env.nexturl + `${name}.json`;
  //console.log(url)
  const client2 = axios.create({
    headers: { 'X-Rephonic-Auth': apiKey }
  });
  async function getJSON() {
    const url = fs.readFileSync('/var/data/url.txt', 'utf8');  + `${name}.json`;
    console.log('attempting to read file' + url)
    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      const data = await response.json();

      // Assuming desc is defined outside this block
      desc = data.pageProps.rawPodcast.description;
      console.log(desc);
      gpt()
    } catch (error) {
      console.error('Error fetching JSON:', error);
      newnext()

    }
  }

  getJSON();

  async function newnext() {

    try {

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', "single-process", "--no-zygote"],
        executablePath:
        process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        :puppeteer.executablePath(),
      });

  const page = await browser.newPage();

  // Intercept network requests
  await page.setRequestInterception(true);

  // Listen for requests and log URLs
  page.on('request', (request) => {
    const urls = request.url();
    if (urls.endsWith('.json')) {
      var seg = urls.split('/');
      seg.pop();
      var modifiedUrl = seg.join('/');
      console.log('Modified URL' + modifiedUrl)

      fs.writeFileSync('/var/data/url.txt', modifiedUrl, err => {
        if (err) {
          console.error(err);
        } else {
          console.log('Success, now running. URL is: ' + modifiedUrl);
          getJSON();
        }
      });
          
    }
    request.continue();
  });

  // Navigate to a website (using a placeholder URL)
  await page.goto(`https://rephonic.com/podcasts/${name}`);

  // Perform other actions on the page if needed

  // Close the browser
  await browser.close();
    }
     catch (error) {
      console.error('Error:', error);
    }
  }
  
async function gpt(){
const params = {
  "model": "gpt-3.5-turbo-16k",
  "messages": [
    {
        "role": "user",
        "content": `
        preferred audience: 

        ${audienceInfo} \n\n
        ------------
        Say yes if the podcast description below fits with the preferred audience above:
    \n\n
        ${desc}
        `
    }
]
}

response = await client.post('https://api.openai.com/v1/chat/completions', params)
.then(result => {
  console.log(result.data.choices[0].message.content);
  c = result.data.choices[0].message.content
  if (c.toLowerCase().includes('yes') === true){
    console.log("yes")
    reph(c)
  }
  else{
    console.log("no")
    c = "no"
    res.send({ c });
  }

}).catch(err => {
  console.log("error:");
console.log(err);
c = "no"
res.send({ c });
});
}

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