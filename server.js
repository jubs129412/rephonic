const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const client = axios.create({
  headers: { 'Authorization': 'Bearer ' + process.env.openai }
});

const app = express();
const port = 3000;
app.use(cors());
app.post('/process', async (req, res) => {
  
  const { apiKey, audienceInfo, name, list } = req.query;
  const url = process.env.nexturl + `${name}`;
  console.log(url)
  const client2 = axios.create({
    headers: { 'X-Rephonic-Auth': apiKey }
  });
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    // Assuming desc is defined outside this block
    const desc = data.pageProps.rawPodcast.description;
    console.log(desc);

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }

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
    c = "no"
    res.send({ c });
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