import {playMode} from 'common/js/config';
import {loadSearch} from 'common/js/cache';
const state = {
    //歌手相关变量
    singer: {},
    //歌单相关变量
    disc: {},
    //播放器相关变量
    playing: false,
    fullScreen: false,
    playlist: [], //歌曲列表
    sequenceList: [], //歌曲顺序列表
    mode: playMode.sequence,
    currentIndex: -1, //控制当前播放的歌曲
    searchHistory: loadSearch() //设置存放搜索历史的数据
}

export default state