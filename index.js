import fs from "fs";
import { stringify } from "csv-stringify";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const ROOT_URL = "https://myanimelist.net";
const URL = ROOT_URL + "/anime/producer";

const results = await fetch(URL);
const text = await results.text();

const dom = new JSDOM(text);

const linkTags = dom.window.document.querySelectorAll("a.genre-name-link");
const urls = Array.from(linkTags).map((linkTag) => linkTag.href);

const resultingData = [];

// for easy
for (const url of urls.slice(0, 1)) {
  // going through each URL that looks like /anime/producer/48/AIC
  const nextUrl = ROOT_URL + url;
  const results = await fetch(nextUrl);
  const text = await results.text();
  const dom = new JSDOM(text);
  const linkTags = dom.window.document.querySelectorAll(".title > a");
  const urls = Array.from(linkTags).map((linkTag) => linkTag.href);
  // includes URLS like
  /*
    'https://myanimelist.net/news/69502772',
    'https://myanimelist.net/anime/5310/Macross_F_Movie_1__Itsuwari_no_Utahime',
    'https://myanimelist.net/anime/56731/Synduality__Noir_Part_2',
    'https://myanimelist.net/topanime.php',
    'https://myanimelist.net/topanime.php?type=airing',
    'https://myanimelist.net/character.php'
  */

  const animeUrls = urls.filter((url) => url.includes("/anime/"));

  for (const animeUrl of animeUrls) {
    const results = await fetch(animeUrl);
    const text = await results.text();
    const dom = new JSDOM(text);
    const document = dom.window.document;

    // pull 5310 out of https://myanimelist.net/anime/5310/Macross_F_Movie_1__Itsuwari_no_Utahime
    const animeUrlParts = animeUrl.split("/");
    const animePart = animeUrlParts.indexOf("anime");
    const idAsString = animeUrlParts[animePart + 1];
    const id = parseInt(idAsString, 10);

    // pull out other parts
    const score = document.querySelector(".score-label").textContent;
    const name = document.querySelector(".title-name").textContent;
    console.log(id, name, score);

    resultingData.push({ id, name, score });
  }
}

// Now that we've collected all of our data, write it to a csv
const filename = "animes.csv";
const writableStream = fs.createWriteStream(filename);

const stringifier = stringify(resultingData, {
  header: true,
});

stringifier.pipe(writableStream);
