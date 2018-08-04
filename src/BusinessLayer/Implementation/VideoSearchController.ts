import IQueryable from '../../DataLayer/Interface/IQueryable';
import * as youtube from 'youtube-api-v3-search';
import Video from '../../DataLayer/Domain/Video';
import VideoQuery from '../../DataLayer/Domain/VideoQuery';

interface IVideo {
    id?: string;
    videoKey: string;
    title: string;
    description: string;
    thumbnail: string;
}

export default class VideoSearchController {
    DataSource: IQueryable;
    private _Video: Video;
    private _VideoQuery: VideoQuery;
    private apiKey = "AIzaSyD53DiX0mIbfZbaG5Gw4wz70Od9HuwY9Gs";

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
            } else {
                cb(results.map((res) => {
                    return {
                        id: res['id'],
                        videoKey: res['videoKey'],
                        title: res['title'],
                        description: res['description'],
                        thumbnail: res['thumbnail']
                    }
                }));
            }
        })
    }

    private searchYoutube(query: string, cb: {(results: Array<IVideo>): void}) {
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