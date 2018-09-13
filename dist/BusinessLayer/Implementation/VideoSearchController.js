"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const youtube = require("youtube-api-v3-search");
const Video_1 = require("../../DataLayer/Domain/Video");
const VideoQuery_1 = require("../../DataLayer/Domain/VideoQuery");
const request = require("request");
const iso8601_duration_1 = require("iso8601-duration");
class VideoSearchController {
    constructor(ds) {
        this.apiKey = process.env.YT_API_KEY;
        this.DataSource = ds;
        this._Video = new Video_1.default();
        this._VideoQuery = new VideoQuery_1.default();
        this._Video.setDataSource(this.DataSource);
        this._VideoQuery.setDataSource(this.DataSource);
    }
    search(query, cb) {
        this._VideoQuery.getQueryVideos(query, (error, results) => {
            if (error || results === null) { // query not in database
                this.searchYoutube(query, (videos) => {
                    this.getVideoData(videos, videos => {
                        this._Video.createArray(videos, (error) => {
                            if (!error) {
                                let videoQueries = videos.map(video => {
                                    let q = {
                                        query: query,
                                        videoId: video.id
                                    };
                                    return q;
                                });
                                this._VideoQuery.createArray(videoQueries, (error, queries) => {
                                    if (!error) {
                                        this.search(query, cb);
                                    }
                                });
                            }
                        });
                    });
                });
            }
            else {
                cb(results.map((res) => {
                    return {
                        id: res['id'],
                        videoKey: res['videoKey'],
                        title: res['title'],
                        description: res['description'],
                        thumbnail: res['thumbnail'],
                        duration: res['duruation']
                    };
                }));
            }
        });
    }
    getVideoData(videos, cb) {
        let videoQuery = videos.map(video => {
            return video.videoKey;
        }).join(",");
        let query = "https://www.googleapis.com/youtube/v3/videos?id=" + videoQuery + "&part=contentDetails&key=" + this.apiKey;
        request(query, (error, response, body) => {
            body = JSON.parse(body);
            let details = body.items;
            for (let i = 0; i < details.length; i++) {
                if (details[i].id === videos[i].videoKey) {
                    videos[i].duration = iso8601_duration_1.toSeconds(iso8601_duration_1.parse(details[i].contentDetails.duration));
                    videos[i].licensedContent = details[i].contentDetails.licensedContent;
                }
                else {
                    throw new Error("Youtube Data Api Failed to Sync Details");
                }
            }
            cb(videos);
        });
    }
    searchYoutube(query, cb) {
        youtube(this.apiKey, {
            q: query,
            maxResults: 10,
            part: "snippet",
            type: "video"
        }, (error, results) => {
            console.log(error);
            let videos = [];
            results.items.map((res) => {
                videos.push({
                    videoKey: res.id.videoId,
                    title: res.snippet.title,
                    description: res.snippet.description,
                    thumbnail: res.snippet.thumbnails.default.url
                });
            });
            cb(videos);
        });
    }
}
exports.default = VideoSearchController;
//# sourceMappingURL=VideoSearchController.js.map