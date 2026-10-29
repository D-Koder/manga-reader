import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import baseUrl from "../data/connection";

function NewApi() {
  const [images, setImages] = useState([]);
  const [chapters] = useState([]);
  const [qualityImg] = useState(true);
  const [prevChap, setPrevChap] = useState([]);
  const [nextChap, setNextChap] = useState([]);
  const [error, setError] = useState("Loading ...");
  const { chapterID, mangaId } = useParams();
  // console.log(useParams());
  useEffect(() => {
    refreshImages();
    // Runs once on mount, as before; refreshImages is not a stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const refreshImages = () => {
    // const chapterID = '27cd0902-ad4c-490a-b752-ae032f0503c9';
    const endpoint = baseUrl + "/at-home/server/" + chapterID;
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
        // console.log(data);
        let host = data.baseUrl;
        let chapterHash = data.chapter.hash;
        let tempArray = [];
        if (!qualityImg) {
          data.chapter.data.forEach((element) => {
            //host+"/data/"+chapterHash+"/"+data[0];
            tempArray.push(`${host}/data/${chapterHash}/${element}`);
          });
        } else {
          data.chapter.dataSaver.forEach((element) => {
            //host+"/data/"+chapterHash+"/"+data[0];
            tempArray.push(`${host}/data-saver/${chapterHash}/${element}`);
          });
        }
        setError("");
        setImages(tempArray);
      });

    //Get mangaid
    fetch(baseUrl + "/chapter/" + chapterID)
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
        // console.log(data);
        // console.log(data.data);
        // console.log(data.data.relationships);
        for (let index = 0; index < data.data.relationships.length; index++) {
          if (data.data.relationships[index].type === "manga") {
            // console.log(data.data.relationships[index].id);
            fetch(baseUrl + "/chapter/" + chapterID)
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
                // console.log(data);
                // console.log(data.data);
                // console.log(data.data.relationships);
                for (
                  let index = 0;
                  index < data.data.relationships.length;
                  index++
                ) {
                  if (data.data.relationships[index].type === "manga") {
                    //Get chapters
                    // console.log(data.data.relationships[index].id);
                    fetch(
                      baseUrl +
                        "/manga/" +
                        data.data.relationships[index].id +
                        "/feed"
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
                        // console.log(data);
                        data.data.forEach((element) => {
                          var tempChapter = {
                            chapter: Number.parseInt(
                              element.attributes.chapter
                            ),
                            id: element.id,
                          };
                          chapters.push(tempChapter);
                        });
                        setError("");
                        // console.log(chapters);
                        //Sort chapters

                        for (let i = 0; i < chapters.length; i++) {
                          for (let j = 0; j < chapters.length; j++) {
                            if (chapters[i].chapter > chapters[j].chapter) {
                              var tempval = chapters[i];
                              chapters[i] = chapters[j];
                              chapters[j] = tempval;
                            }
                          }
                        }
                        var current;
                        for (let i = 0; i < chapters.length; i++) {
                          // console.log(
                          //   i + ": " + chapterID + "-" + chapters[i].id
                          // );
                          if (chapterID === chapters[i].id) {
                            current = i;
                          }
                        }
                        //Get previous chapter
                        // console.log(
                        //   "===========GETTING PREV AND NEXT " +
                        //     current +
                        //     "=================="
                        // );
                        for (let i = 0; i < chapters.length; i++) {
                          if (i === current) {
                            // console.log("previous was");
                            if (i + 1 < chapters.length) {
                              // console.log();
                              setPrevChap(chapters[i + 1].id);
                            } else {
                              // console.log("is first chapter");
                              setPrevChap(-2);
                            }
                            // console.log("next was");
                            if (i > 0) {
                              // console.log(chapters[i - 1].id);
                              setNextChap(chapters[i - 1].id);
                            } else {
                              // console.log("is last chapter");
                              setNextChap(-2);
                            }
                          }
                        }
                        console.log(
                          "===============        DONE      =================="
                        );
                      });
                  }
                }
              });
          }
        }
      });
    //Get previous and next chapter
  };

  return (
    <>
      {" "}
      {error.length > 0 && (
        <>
          <p
            style={{
              textAlign: "center",
              background: "black",
              color: "white",
              fontWeight: "bold",
              padding: "7px",
              margin: "0",
            }}
          >
            {error}
          </p>
          <button
            className="errorButton"
            onClick={() => setError("")}
            style={{ float: "right" }}
          >
            X
          </button>
        </>
      )}
      <div style={{ display: "grid", margin: "10px 0" }}>
        <div style={{ textAlign: "center" }}>
          {localStorage.getItem("MangaTitle")}
        </div>
        <div className="page-nav">
          {prevChap !== -2 ? (
            <a href={"/ViewManga/" + mangaId + "/ViewChapter/" + prevChap}>
              Previous Chapter
            </a>
          ) : null}
          {nextChap !== -2 ? (
            <a href={"/ViewManga/" + mangaId + "/ViewChapter/" + nextChap}>
              Next Chapter
            </a>
          ) : null}
        </div>
        {images.length > 0 &&
          images.map((url, index) => (
            <img
              style={{ borderTop: "1px solid" }}
              src={url}
              alt={`Page ${index + 1}`}
              key={index}
            ></img>
          ))}
        <div className="page-nav">
          {prevChap !== -2 ? (
            <a href={"/ViewManga/" + mangaId + "/ViewChapter/" + prevChap}>
              Previous Chapter
            </a>
          ) : null}
          {nextChap !== -2 ? (
            <a href={"/ViewManga/" + mangaId + "/ViewChapter/" + nextChap}>
              Next Chapter
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default NewApi;
