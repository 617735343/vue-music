import state from "./state";

export const singer = state => state.singer;

export const disc = state => state.disc;

export const playing = state => state.playing;

export const fullScreen = state => state.fullScreen;

export const playlist = state => state.playlist;

export const sequenceList = state => state.sequenceList;

export const mode = state => state.mode;

export const currentIndex = state => state.currentIndex;

//用currentIndex去拿到currentSong
export const currentSong = (state) => {
    return state.playlist[state.currentIndex] || {}
}