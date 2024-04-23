const express = require('express');
var app = express();
const port = 9000;//5000
const path = require('path');
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client')));

app.get("/api/home", (_, res) => {
  axios.get('https://cd-static.bamgrid.com/dp-117731241344/home.json').then((response) => {
    res.json(response.data);
  }).catch((e) => {
    console.error("Error getting home.json:");
    console.error(e);
    res.json({ "error": e });
  });
});

app.get("/api/ref/:refId", (req, res) => {
  const refId = req.params.refId;
  if (refId == null) {
    console.log("Error getting refId");
  } else {
    axios.get('https://cd-static.bamgrid.com/dp-117731241344/sets/'+refId+'.json').then((response) => {
      res.json(response.data);
    }).catch((e) => {
      console.error("Error getting refId "+refId+":");
      console.error(e);
      res.json({ "error": e });
    });
  }
})

app.get('/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});