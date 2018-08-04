"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const youtube = require("youtube-api-v3-search");
const Video_1 = require("../../DataLayer/Domain/Video");
const VideoQuery_1 = require("../../DataLayer/Domain/VideoQuery");
class VideoSearchController {
    constructor(ds) {
        this.apiKey = "AIzaSyD53DiX0mIbfZbaG5Gw4wz70Od9HuwY9Gs";
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
            }
            else {
                cb(results.map((res) => {
                    return {
                        id: res['id'],
                        videoKey: res['videoKey'],
                        title: res['title'],
                        description: res['description'],
                        thumbnail: res['thumbnail']
                    };
                }));
            }
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