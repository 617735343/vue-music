import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

function findIndex(list,song) {
    return list.findIndex((item) => {
        return item.id === song.id;
    })
}

export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list);
    //如果播放模式是随机播放模式就让list进行洗牌，然后判断洗牌后的歌曲的id和没洗牌前的歌曲id是否一样，一样返回这个歌曲现在的index
    if(state.mode === playMode.random) {
        let randomList = shuffle(list);
        commit(types.SET_PLAYLIST, randomList);
        index = findIndex(randomList, list[index]);
    }else {
        commit(types.SET_PLAYLIST, list);
    }
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}

//按随机播放的时候执行
export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random);
    commit(types.SET_SEQUENCE_LIST, list);
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    commit(types.SET_CURRENT_INDEX, 0);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}

//搜索点击歌曲
export const insertSong = function({commit,state}, song) {
    let playlist = state.playlist.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;
    //记录当前歌曲
    let currentSong = playlist[currentIndex];
    //查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song);
    //因为是插入歌曲，所以索引+1
    currentIndex++;
    //插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song);
    //如果已经包含了这首歌
    if(fpIndex > -1) {
        //如果当前插入的序号大于列表中的序号
        if(currentIndex > fpIndex) {
            //删除这首歌
            playlist.splice(fpIndex, 1);
            currentIndex--;
        }else{
            //删除这首歌
            playlist.splice(fpIndex + 1, 1)
        }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1;

    let fsIndex = findIndex(sequenceList, song);

    sequenceList.splice(currentSIndex, 0, song);

    if(fsIndex > -1) {
        if(currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1);
        }else {
            sequenceList.splice(fsIndex + 1, 1);
        }
    }

    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}