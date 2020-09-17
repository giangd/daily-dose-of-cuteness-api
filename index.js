const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
    res.send("hello api");
});

app.get("/api/:name/:numImages/:after", async (req, res) => {
    console.log("get /api/:name");
    let { name, numImages, after } = req.params;
    if (after === "undefined") {
        after = undefined;
    }

    const apiCall = `https://www.reddit.com/r/${name}/hot.json`;
    const config = {
        params: {
            raw_json: 1,
            limit: numImages - 1,
            after: after,
        },
        crossdomain: true,
    };

    try {
        const {
            data: { data },
        } = await axios.get(apiCall, config);

        const afterId = data.after;

        const arrayOfPostObjects = [...data.children];

        const mediaObjects = [];
        for (const postObject of arrayOfPostObjects) {
            // console.log(postObject.data.post_hint);
            const postHint = postObject.data.post_hint;

            const mediaObject = {
                type: undefined,
                id: undefined,
                subreddit: undefined,
                redditLink: undefined,
                url: undefined,
                posterUrl: undefined,
                height: undefined,
                width: undefined,
                isHeartClicked: false,
            };

            switch (postHint) {
                case "rich:video": // gif
                    mediaObject.type = "gif";
                    mediaObject.subreddit = `${postObject.data.subreddit}`;
                    mediaObject.url = `${postObject.data.secure_media.oembed.thumbnail_url}`; // compressed gif, can get uncompressed version
                    mediaObject.height = `${postObject.data.secure_media.oembed.thumbnail_height}`;
                    mediaObject.width = `${postObject.data.secure_media.oembed.thumbnail_width}`;

                    break;
                case "hosted:video": // reddit video
                    mediaObject.type = "reddit video";
                    mediaObject.subreddit = `${postObject.data.subreddit}`;

                    // mediaObject.url =
                    // postObject.data.preview.images[0].source.url; // highest resolution, can get lower
                    mediaObject.url =
                        postObject.data.media.reddit_video.fallback_url;
                    mediaObject.posterUrl =
                        postObject.data.preview.images[0].source.url; // highest resolution, can get lower
                    mediaObject.height =
                        postObject.data.media.reddit_video.height;
                    mediaObject.width =
                        postObject.data.media.reddit_video.width;
                    break;
                case "image": // image
                    mediaObject.type = "image";
                    mediaObject.subreddit = `${postObject.data.subreddit}`;

                    mediaObject.url =
                        postObject.data.preview.images[0].source.url; // highest resolution, can get lower
                    mediaObject.height =
                        postObject.data.preview.images[0].source.height;
                    mediaObject.width =
                        postObject.data.preview.images[0].source.width;
                    break;
                case "link":
                case "self":
                default:
                    console.log(`defaulted with postHint: ${postHint}`);
                    continue;
            }
            mediaObjects.push(mediaObject);
        }
        res.send({ afterId, mediaObjects });
    } catch (err) {
        console.log("error:", err);
    }
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});
