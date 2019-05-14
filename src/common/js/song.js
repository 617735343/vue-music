import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
import { resolve } from 'url';
import { rejects } from 'assert';

export default class Song {
    constructor({id,mid,singer,name,album,duration,image,url}) {
        this.id = id;
        this.mid = mid,
        this.singer = singer,
        this.name = name,
        this.album = album,
        this.duration = duration,
        this.image = image,
        this.url = url
    }

    //请求歌词数据
    getLyric() {
        //如果每次这个song变化我都要去请求数据这是不合理的，所以要判断this.lyric是否存在，存在就不去请求歌词，不存在就去请求歌词。
        if(this.lyric) {
            return Promise.resolve(this.lyric);
        }
        return new Promise((resolve,rejects) => {
            getLyric(this.mid).then((res) => {
                if(res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric);
                    resolve(this.lyric);
                }else {
                    rejects("no lyric");
                }
            })
        })
        
    }
}

export function createSong(items,musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        // url: `http://dl.stream.qqmusic.qq.com/C400${musicData.strMediaMid}.m4a?fromtag=38`
        url: `http://dl.stream.qqmusic.qq.com/C400${items.songmid}.m4a?vkey=${items.vkey}&guid=7981028948&uin=0&fromtag=66`
    })
}

export function createSongDisc(items,musicData) {
    if(items) {
        return new Song({
            id: musicData.songid,
            mid: musicData.songmid,
            singer: filterSinger(musicData.singer),
            name: musicData.songname,
            album: musicData.albumname,
            duration: musicData.interval,
            image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
            url: items.sip[0] + items.midurlinfo[0].purl
        })
    }else {
        return new Song({
            id: musicData.songid,
            mid: musicData.songmid,
            singer: filterSinger(musicData.singer),
            name: musicData.songname,
            album: musicData.albumname,
            duration: musicData.interval,
            image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
        })
    }
    
}

export function createSongRank(items, musicData) {
    return new Song({
        id: musicData.id,
        mid: musicData.mid,
        singer: filterSinger(musicData.singer),
        name: musicData.name,
        album: musicData.album.name,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.album.mid}.jpg?max_age=2592000`,
        url: items.sip[0] + items.midurlinfo[0].purl
    })
}

function filterSinger(singer) {
    let ret = [];
    if(!singer) {
        return ''
    }
    if(singer instanceof Array) {
        singer.forEach((s) => {
            ret.push(s.name)
        });
    }else {
        singer.singer;
    }
    
    return ret.join('/');
}