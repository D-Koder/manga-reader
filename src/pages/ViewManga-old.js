import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import baseUrl from "../data/connection";
//view manga

function ViewManga() {
  const [chapters, setChapters] = useState([]);
  //title,cover image
  const [mangaTitle, setMangaTitle] = useState([]);
  const [altTitles, setAltMangatitles] = useState([]);
  const [description, setDescrition] = useState({});
  const [author, setAuthor] = useState([]);
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState("Loading ...");
  const { mangaId } = useParams();

  let phrase = {
    en: "10 years ago, after \u201cthe Gate\u201d that connected the real world with the monster world opened, some of the ordinary, everyday people received the power to hunt monsters within the Gate. They are known as \u201cHunters\u201d. However, not all Hunters are powerful. My name is Sung Jin-Woo, an E-rank Hunter. I\u2019m someone who has to risk his life in the lowliest of dungeons, the \u201cWorld\u2019s Weakest\u201d. Having no skills whatsoever to display, I barely earned the required money by fighting in low-leveled dungeons\u2026 at least until I found a hidden dungeon with the hardest difficulty within the D-rank dungeons! In the end, as I was accepting death, I suddenly received a strange power, a quest log that only I could see, a secret to leveling up that only I know about! If I trained in accordance with my quests and hunted monsters, my level would rise. Changing from the weakest Hunter to the strongest S-rank Hunter!\n\n---\n\n- [1st Trailer](https://www.youtube.com/watch?v=hLwQUZgFiM4) | [ENG](https://www.youtube.com/watch?v=SP5TdrbsePE) | [JP](https://www.youtube.com/watch?v=lY82MjIM99o)\n\n- [2nd Trailer](https://www.youtube.com/watch?v=JRXcbcEnqEs) | [ENG](https://www.youtube.com/watch?v=whx0WCtc9DQ) | [JP](https://www.youtube.com/watch?v=ZPxjjbRaIwk)\n\n- [S2 <Return> PV](https://www.youtube.com/watch?v=Hd_zT6I5K6c)\n\n- [Original Webtoon <Webtoon kakao>](https://webtoon.kakao.com/content/%EB%82%98-%ED%98%BC%EC%9E%90%EB%A7%8C-%EB%A0%88%EB%B2%A8%EC%97%85/2320)\n\n---\n\n- [Original Book <Yes24>](http://www.yes24.com/Product/Goods/78527123)\n- [Original Book <Aladin>](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=206124229)\n>\n- [Book <Japanese Edition>](https://www.kadokawa.co.jp/product/321906000298/)\n\n- [Book <German Edition>](https://altraverse.de/manga/solo-leveling/)\n\n- [Book <English Edition>](https://yenpress.com/search-list/?keyword=SOLO%2BLEVELING%2BComic)\n\n- [Book <Italian Edition>](https://www.starcomics.com/titoli-fumetti/solo-leveling)\n\n---\n\n- Official English Translation [<Pocket Comics>](https://www.pocketcomics.com/comic/320) | [<WebNovel>](https://www.webnovel.com/comic/only-i-level-up-(solo-leveling)_15227640605485101) | [<Tapas>](https://tapas.io/series/solo-leveling-comic/info)\n\n- [Official Traditional Chinese Translation](https://tw.kakaowebtoon.com/content/%E6%88%91%E7%8D%A8%E8%87%AA%E5%8D%87%E7%B4%9A/53)\n\n- [Official Simplified Chinese Translation](https://www.kuaikanmanhua.com/web/topic/4319/)\n\n- [Official Indonesian Translation](https://kakaopage.co.id/content/Solo-Leveling/3375)\n\n- [Official Japanese Translation](https://piccoma.com/web/product/5523)\n\n- [Official French Translation](https://www.verytoon.com/serie/solo-leveling)\n\n- [Official Thai Translation](https://th.kakaowebtoon.com/content/solo_leveling/48)\n\n---\n\n- [Original LNovel Book <Aladin>](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=204209839)\n- [Original LNovel Book <Yes24>](http://www.yes24.com/Product/Goods/78213344) \n>\n- <Japanese Edition> [Web](https://piccoma.com/web/product/18836) | [Book](https://www.kadokawa.co.jp/product/322009000190/)\n\n- <English Edition> [Web](https://www.webnovel.com/book/only-i-level-up-(solo-leveling)_12507348206677105) | [Book](https://yenpress.com/series-search/?series=solo+leveling+novel)\n\n- [<German Edition>](https://altraverse.de/manga/solo-leveling/)",
  };

  // console.log(useParams());

  useEffect(() => {
    refreshImages();
  }, []);

  const refreshImages = () => {
    localStorage.removeItem("mangaId");
    //561d16e8-c2ac-427f-8e68-3f5d5ca35ddc
    // const chapterID = '27cd0902-ad4c-490a-b752-ae032f0503c9';
    ///manga/{id}/feed
    const endpoint = baseUrl + "/manga/" + mangaId;
    //Get chapters
    console.log(endpoint + "/feed");
    fetch(endpoint + "/feed")
      .then((response) => {
        if (response.status === 429) {
          setError("Refreshed to fast.");
        } else if (response.status !== 200) {
          setError("Unknown error occured: " + response.status);
        } else {
          return response.json();
        }
      })
      .then((data) => {
        //go through each chapter
        let tempChapters = [];
        let tempScanGroup = [];
        let promises = [];
        data.data.forEach((element) => {
          let scan = "";
          let tempChapter = [];
          //get the scan group id
          for (let index = 0; index < element.relationships.length; index++) {
            if (
              element.relationships[index].type == "scanlation_group" &&
              !(element.relationships[index].id in tempScanGroup)
            ) {
              tempScanGroup[element.relationships[index].id] = "";
              //get scan group details
              promises.push(
                fetch(baseUrl + "/group/" + element.relationships[index].id)
                  .then((response) => {
                    if (response.status === 429) {
                      setError("Refreshed to fast.");
                    } else if (response.status !== 200) {
                      setError("Unknown error occured: " + response.status);
                    } else {
                      return response.json();
                    }
                  })
                  .then((data) => {
                    //set scan as scan group name
                    scan = data.data.attributes.name;
                    tempScanGroup[element.relationships[index].id] = scan;

                    // chapters.push(tempChapter);
                  })
              );
              //get rest of details and create array
            }
            if (element.relationships[index].type == "scanlation_group") {
              tempChapter = {
                chapter:
                  element.attributes.chapter != null
                    ? Number.parseInt(element.attributes.chapter)
                    : element.attributes.title,
                id: element.id,
                scan: element.relationships[index].id,
              };
              tempChapters.push(tempChapter);
            }
          }

          //results => prints the array before receiving scan group
        });
        Promise.all(promises).then(() => {
          for (let i = 0; i < tempChapters.length; i++) {
            tempChapters[i].scanName = tempScanGroup[tempChapters[i].scan];
          }

          for (let i = 0; i < tempChapters.length; i++) {
            for (let j = 0; j < tempChapters.length; j++) {
              if (tempChapters[i].chapter > tempChapters[j].chapter) {
                var tempval = tempChapters[i];
                tempChapters[i] = tempChapters[j];
                tempChapters[j] = tempval;
              }
            }
          }
          setChapters(tempChapters);
        });
        // console.log(chapters);
        //Sort chapters
      });
    //Get coverpage id
    fetch(endpoint)
      .then((response) => {
        if (response.status === 429) {
          setError("Refreshed to fast.");
        } else if (response.status !== 200) {
          setError("Unknown error occured: " + response.status);
        } else {
          return response.json();
        }
      })
      .then((data) => {
        for (let index = 0; index < data.data.relationships.length; index++) {
          if (data.data.relationships[index].type == "author") {
            Promise.all([
              fetch(
                "https://api.mangadex.org/author/" +
                  data.data.relationships[index].id
              )
                .then((response) => {
                  if (response.status === 429) {
                    setError("Refreshed to fast.");
                  } else if (response.status !== 200) {
                    setError("Unknown error occured: " + response.status);
                  } else {
                    return response.json();
                  }
                })
                .then((data) => {
                  author.push(data.data.attributes.name);
                }),
            ]).then();
          }
        }
        setAltMangatitles(data.data.attributes.alttitles);
        setMangaTitle(
          data.data.attributes.title != null
            ? Object.values(data.data.attributes.title)[0]
            : Object.values(data.data.attributes.altTitles)[0]
        );
        setDescrition(data.data.attributes.description);
        phrase = data.data.attributes.description;
        //Get main name

        //get cover image
        for (let index = 0; index < data.data.relationships.length; index++) {
          if (data.data.relationships[index].type == "cover_art") {
            // console.log(data.data.relationships[index].id);
            fetch(baseUrl + "/cover/" + data.data.relationships[index].id)
              .then((response) => {
                if (response.status === 429) {
                  setError("Refreshed to fast.");
                } else if (response.status !== 200) {
                  setError("Unknown error occured: " + response.status);
                } else {
                  return response.json();
                }
              })
              .then((data) => {
                for (
                  let index = 0;
                  index < data.data.relationships.length;
                  index++
                ) {
                  if (data.data.relationships[index].type == "manga") {
                    setCoverImage(
                      "https://uploads.mangadex.org/covers/" +
                        data.data.relationships[index].id +
                        "/" +
                        data.data.attributes.fileName +
                        ".512.jpg"
                    );
                  }
                }
              });
          }
        }
      });
    setError("");
  };
  // refreshImages();
  return (
    <>
      <div style={{ display: "grid", margin: "3px 0px" }}>
        <div id="leftpanel">
          <img
            src={coverImage}
            style={{
              width: "100%",
              maxWidth: "400px",
              marginTop: "3px",
              boxShadow: "0px 0px 4px 1px #b7b7b7",
            }}
          />

          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "10px",
            }}
          >
            {mangaTitle}
          </div>
          <div
            style={{
              fontWeight: "bolder",
              textAlign: "center",
              padding: "3px 0",
              fontSize: "10px",
              color: "cornflowerblue",
            }}
          >
            {author.map((author, key) => (
              <div key={key}>{author}</div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid rgb(176, 176, 176)",
              lineHeight: "136%",
              fontSize: 20,
              padding: 10,
            }}
          >
            {description.en == "" ? "No description avaliable" : null}
            <div>
              {
                <div style={{ fontWeight: "bold" }}>
                  {String(description.en).split("---")[0]}
                  {/* {phrase.en.split("---")[0]} */}
                </div>
              }
              {String(description.en)
                .split("---")
                .map((desc, key) =>
                  desc.split("- ").map((desc2, key) =>
                    key !== 0 ? (
                      // {desc2}
                      <div
                        style={{
                          display: "list-item",
                          marginLeft: "1em",
                          fontWeight: "bold",
                        }}
                        key={key}
                      >
                        {/* {console.log(desc2)} */}
                        {desc2.split("|").map(
                          (data, key, a, v) => (
                            console.log(desc2),
                            //Create the a tag
                            ((v = data),
                            (data =
                              "" +
                              data
                                .trim()
                                .replace(/^### (.*$)/gim, "<h3>$1</h3>") // h3 tag
                                .replace(/^## (.*$)/gim, "<h2>$1</h2>") // h2 tag
                                .replace(/^# (.*$)/gim, "<h1>$1</h1>") // h1 tag
                                .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>") // bold text
                                .replace(/\*(.*)\*/gim, "<i>$1</i>") // italic text
                                .replace(/\r\n|\r|\n/gim, "<br>") // linebreaks
                                .replace(
                                  /\[([^\[]+)\](\(([^)]*))\)/gim,
                                  '<a href="$3">$1</a>'
                                ))),
                            (v = v.split("](https:")[0].split("[")[0]),
                            console.log(v),
                            (
                              <>
                                {/* Create atag based on demo version */}
                                {v}{" "}
                                <a
                                  style={{ color: "blue" }}
                                  target={"_blank"}
                                  rel={"noopener noreferrer"}
                                  href={data
                                    .match(/href=(["'])(.*?)\1/g)[0]
                                    .replace('href="', "")
                                    .slice(0, -1)}
                                >
                                  {data
                                    .match(/\">(.*?<\/a>)/g)[0]
                                    .replace("</a>", "")
                                    .replace('">', "")}
                                </a>
                                {desc2.split("|").length > key + 1
                                  ? "  |  "
                                  : ""}
                              </>
                            )
                          )
                        )}
                      </div>
                    ) : null
                  )
                )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              /* height: '100%', */ justifyContent: "center",
            }}
          >
            <div
              id="list"
              style={{
                borderRadius: "3px" /* height: '100%', */,
                width: "100%",
                borderTop: "1px solid #b0b0b0",
              }}
            >
              {chapters.length > 0 &&
                chapters.map((values, index) => (
                  <a
                    href={"ViewChapter/" + values.id}
                    key={index}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        padding: "10px 13px",
                        borderBottom: "1px solid rgb(176, 176, 176)",
                        color: "rgba(129, 171, 255, 0.9)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>{values.chapter}</div>
                      <div style={{ fontSize: "11px", color: "#acacac" }}>
                        {values.scanName}
                      </div>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </div>
        <div id="rightpanel" />
      </div>
    </>
  );
}

export default ViewManga;
