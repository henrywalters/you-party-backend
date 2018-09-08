import IQueryable from '../../DataLayer/Interface/IQueryable';
import * as youtube from 'youtube-api-v3-search';
import Video from '../../DataLayer/Domain/Video';
import VideoQuery from '../../DataLayer/Domain/VideoQuery';
import Config from '../../Helpers/ConfigHelper';
import * as request from 'request';
import { parse, toSeconds } from 'iso8601-duration';

interface IVideo {
    id?: string;
    videoKey: string;
    title: string;
    description: string;
    thumbnail: string;
    duration?: number;
    licensedContent?: string;
}

export default class VideoSearchController {
    DataSource: IQueryable;
    private _Video: Video;
    private _VideoQuery: VideoQuery;
    private apiKey = Config.get("youtube-api-key")

    constructor(ds: IQueryable) {
        this.DataSource = ds;
        this._Video = new Video();
        this._VideoQuery = new VideoQuery();
        this._Video.setDataSource(this.DataSource);
        this._VideoQuery.setDataSource(this.DataSource);
    }

    public search(query: string, cb: {(results: Array<IVideo>): void}) {
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
                                    }
                                    return q;
                                })

                                this._VideoQuery.createArray(videoQueries, (error, queries) => {
                                    if (!error) {
                                        this.search(query, cb);
                                    }
                                })
                            }
                        })
                    });
                });
            } else {
                cb(results.map((res) => {
                    return {
                        id: res['id'],
                        videoKey: res['videoKey'],
                        title: res['title'],
                        description: res['description'],
                        thumbnail: res['thumbnail'],
                        duration: res['duruation']
                    }
                }));
            }
        })
    }

    public getVideoData(videos: Array<IVideo>, cb: {(results: Array<IVideo>): void}) {
        let videoQuery = videos.map(video => {
            return video.videoKey;
        }).join(",");

        let query = "https://www.googleapis.com/youtube/v3/videos?id=" + videoQuery + "&part=contentDetails&key=" + this.apiKey;

        request(query, (error, response, body) => {
            body = JSON.parse(body);
            let details = body.items;

            for (let i = 0; i < details.length; i++) {
                if (details[i].id === videos[i].videoKey) {
                    videos[i].duration = toSeconds(parse(details[i].contentDetails.duration));
                    videos[i].licensedContent = details[i].contentDetails.licensedContent;
                } else {
                    throw new Error("Youtube Data Api Failed to Sync Details");
                }
            }

            cb(videos);
        })
    }

    public searchYoutube(query: string, cb: {(results: Array<IVideo>): void}) {
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
            })
            cb(videos);
        })
    }
}