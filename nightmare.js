const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const fs = require('fs');

nightmare
  .goto('https://www.bhaskar.com')
  .wait('#root')
  .evaluate(() => {
    let mailUrl = 'https://www.bhaskar.com';
    let ul = document.querySelectorAll('#root > div.eea00180 > div.df89d18b > div.f0e619a2 > div > div.ba1e62a6 > ul');
    let ulArray = [];
    ul.forEach((item) => {
      let a = item.querySelectorAll('a');
      a.forEach((itemhref) => {
        if(itemhref.toString().search('.html') != -1){
          ulArray.push(mailUrl+itemhref.getAttribute('href'));
        }
      });
    });
    return ulArray;
  })
  .then(function(data) {
    data.forEach((item) => {
      nightmare
        .goto(item)
        .wait('#root')
        .wait(5000)
        .evaluate(() => {
          let browserUrl = document.URL;
          let splitUrl = browserUrl.split('/');
          let link = splitUrl[splitUrl.length-1];
          let heading = document.querySelectorAll('h1');
          let paragraph = document.querySelectorAll('p');
          let image = document.querySelectorAll('img');
          let paraArray = [];
          let headArray = [];
          let imgArray = [];
          let finalData = [];
          heading.forEach((headingItem) => {
            headArray.push(headingItem.innerText);
          });
          paragraph.forEach((paragraphItem) => {
            paraArray.push(paragraphItem.innerText);
          });
          image.forEach((imageItem) => {
            imgArray.push(imageItem.getAttribute('src'));
          });
          finalData.push({'heading': headArray, 'paragraph': paraArray, 'image': imgArray, 'link': link});
          return finalData;
        })
        .then(function(pageData) {
          let fileName = pageData[0].link;
          pageData = JSON.stringify(pageData, null, 2);
          fs.writeFileSync(fileName+".json", pageData);
        })
        .catch(error => {
          console.error('Scraping failed via url:', error)
        })
    });
  })
  .catch(error => {
    console.error('Scraping failed:', error)
  })