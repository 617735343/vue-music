<template>
  <div class="player" v-show="playlist.length>0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" alt>
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart="middleTouchStart" @touchmove="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image" alt>
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{'current': currentLineNum === index}"
                  v-for="(line,index) in currentLyric.lines"
                  :key="index"
                >{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <!-- 迷你播放器 -->
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image" alt>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio
      ref="audio"
      :src="currentSong.url"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import animations from "create-keyframe-animation";
import { prefixStyle } from "common/js/dom";
import ProgressBar from "base/progress-bar/progress-bar";
import ProgressCircle from "base/progress-circle/progress-circle";
import { playMode } from "common/js/config";
import { shuffle } from "common/js/util";
import Lyric from "lyric-parser";
import Scroll from 'base/scroll/scroll';

const transform = prefixStyle("transform");
const transitionDuration = prefixStyle('transitionDuration');
export default {
  data() {
    return {
      //控制progress-circle的大小
      radius: 32,
      //控制歌曲加载到才能去切到该歌曲
      songReady: false,
      //歌曲播放的时间
      currentTime: 0,
      //歌词
      currentLyric: null,
      //当前歌词所在的行数
      currentLineNum: 0,
      //切换唱片和歌词的点
      currentShow: "cd",
      //显示当前歌词
      playingLyric: '',
    };
  },
  computed: {
    //控制唱片旋转动画
    cdCls() {
      return this.playing ? "play" : "play pause";
    },
    //控制播放按钮的图标
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    miniIcon() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    //计算当前播放时间的进度条的比例
    percent() {
      return this.currentTime / this.currentSong.duration; //用当前播放时间去除于总时间
    },
    //当歌曲不能切换的时候更改样式
    disableCls() {
      return this.songReady ? "" : "disable";
    },
    //控制歌曲播放模式的样式
    iconMode() {
      return this.mode === playMode.sequence
        ? "icon-sequence"
        : this.mode === playMode.loop
        ? "icon-loop"
        : "icon-random";
    },
    ...mapGetters([
      "fullScreen",
      "playlist",
      "currentSong",
      "playing",
      "currentIndex",
      "mode",
      "sequenceList"
    ])
  },
  created() {
    //放touch相关的变量
    this.touch = {};
  },
  methods: {
    //控制播放器和迷你播放器的显示隐藏
    back() {
      this.setFullScreen(false);
    },
    open() {
      this.setFullScreen(true);
    },
    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN",
      setPlayingState: "SET_PLAYING_STATE",
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayMode: "SET_PLAY_MODE",
      setPlaylist: "SET_PLAYLIST"
    }),
    //实现图片弹出的动画
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      };

      animations.registerAnimation({
        name: "move",
        animation,
        presets: {
          duration: 400,
          easing: "linear"
        }
      });

      animations.runAnimation(this.$refs.cdWrapper, "move", done);
    },
    afterEnter() {
      animations.unregisterAnimation("move");
      this.$refs.cdWrapper.style.animation = "";
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = "all 0.4s";
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      this.$refs.cdWrapper.addEventListener("transitionend", done);
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = "";
      this.$refs.cdWrapper.style[transform] = "";
    },
    //计算图片移动的距离
    _getPosAndScale() {
      const targetwidth = 40;
      const paddingLeft = 40;
      const paddingBottom = 30;
      const paddingTop = 80;
      const width = window.innerWidth * 0.8;
      const scale = targetwidth / width;
      const x = -(window.innerWidth / 2 - paddingLeft);
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return {
        x,
        y,
        scale
      };
    },
    //控制歌曲播放暂停
    togglePlaying() {
      //如果歌曲还没有获取到直接return
      if (!this.songReady) {
        return;
      }
      this.setPlayingState(!this.playing);
      if(this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    //控制播放上一首歌曲
    prev() {
      if (!this.songReady) {
        return;
      }
      let index = this.currentIndex - 1;
      if (index === -1) {
        index = this.playlist.length - 1;
      }
      this.setCurrentIndex(index);
      //如果是暂停状态的话就变成播放的状态
      if (!this.playing) {
        this.togglePlaying();
      }
      //让它回到false
      this.songReady = false;
    },
    next() {
      if (!this.songReady) {
        return;
      }
      let index = this.currentIndex + 1;
      if (index === this.playlist.length) {
        index = 0;
      }
      this.setCurrentIndex(index);
      //如果是暂停状态的话就变成播放的状态
      if (!this.playing) {
        this.togglePlaying();
      }
      this.songReady = false;
    },
    //当加载到歌曲时执行
    ready() {
      this.songReady = true;
    },
    //当歌曲加载失败的时候执行
    error() {
      this.songReady = true;
    },
    //监听播放的时间
    updateTime(e) {
      //获取当前播放的时间(他是一个时间戳)
      this.currentTime = e.target.currentTime;
    },
    //当歌曲播放完执行
    end() {
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    //当歌曲模式是循环播放的时候执行，让歌曲的播放时间回到0
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      if(this.currentLyric) {
        this.currentLyric.seek(0);
      }
    },
    //把时间戳转换成分和秒
    format(interval) {
      interval = interval | 0;
      const minute = (interval / 60) | 0; //分
      const second = interval % 60; //秒
      return `${minute}:${this._pad(second)}`;
    },
    //滚动组件派发过来的时间，传过来一个拖动后的进度比例
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent;
      // currentTime是一个可读写的属性 之间设置当前播放时间(让歌曲的总时间去除于传过来的播放比例)
      this.$refs.audio.currentTime = currentTime;
      
      if (!this.playing) {
        this.togglePlaying();
      }
      if(this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    //帮助秒去补上0,n是代表几位数
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = "0" + num;
        len++;
      }
      return num;
    },
    //每点一次就改变mode
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      //当它等于随机播放的时候，我们让数组洗牌
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlaylist(list);
    },
    //当点击切换歌曲模式的时候，list发生了变化但是当前歌曲不能改变
    resetCurrentIndex(list) {
      //拿到当前歌曲的索引
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    getLyric() {
      this.currentSong.getLyric().then(lyric => {
        //解析歌词
        this.currentLyric = new Lyric(lyric, this.handleLyric);
        //如果歌曲在播放，让歌词跟着换行
        if (this.playing) {
          this.currentLyric.play();
        }

        console.log(this.currentLyric);
        //当发生异常的时候让所有恢复初始值；
      }).catch(() => {
        this.currentLyric = null;
        this.playingLyric = '';
        this.currentLineNum = 0;
      });
    },
    //当歌词每一行发生改变的时候就回调一下
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum;
      //当歌词切到中间的时候让歌词滚动，使他保持在中间的位置
      if(lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum-5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      }else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      //当前展示的歌词
      this.playingLyric = txt;
    },

    middleTouchStart(e) {
      this.touch.initiated = true;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    middleTouchMove(e) {
      if(!this.touch.initiated) {
        return
      }

      const touch = e.touches[0];
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      //如果纵轴滑动的距离大于横轴滑动的距离就不能去切换页面
      if(Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(0,Math.max(-window.innerWidth, left + deltaX));
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    middleTouchEnd() {
      let offsetWidth = 0;
      let opacity = 0;
      if(this.currentShow === 'cd') {
        if(this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        }else {
          opacity = 1;
          offsetWidth = 0;
        }
      }else {
        if(this.touch.percent < 0.9) {
          offsetWidth = 0;
          this.currentShow = 'cd';
          opacity = 1;
        }else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
    },
  },
  watch: {
    //监听currentSong是否有改变
    currentSong(newSong, oldSong) {
      if (newSong.id === oldSong.id) {
        return;
      }
      if(this.currentLyric) {
        this.currentLyric.stop();
      }
      //设置延时
      this.$nextTick(() => {
        this.$refs.audio.play();
        this.getLyric();
      });
    },
    //监听播放的状态
    playing(newPlaying) {
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause();
      });
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
  }
};
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;

            &.play {
              animation: rotate 20s linear infinite;
            }

            &.pause {
              animation-play-state: paused;
            }

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        text-align: center;

        .text {
          line-height: 32px;
          color: $color-text-l;
          font-size: $font-size-medium;

          &.current {
            color: $color-text;
          }
        }
      }
    }
  }

  .bottom {
    position: absolute;
    bottom: 50px;
    width: 100%;

    .dot-wrapper {
      text-align: center;
      font-size: 0;

      .dot {
        display: inline-block;
        vertical-align: middle;
        margin: 0 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $color-text-l;

        &.active {
          width: 20px;
          border-radius: 5px;
          background: $color-text-ll;
        }
      }
    }

    .progress-wrapper {
      display: flex;
      align-items: center;
      width: 80%;
      margin: 0px auto;
      padding: 10px 0;

      .time {
        color: $color-text;
        font-size: $font-size-small;
        flex: 0 0 30px;
        line-height: 30px;
        width: 30px;

        &.time-l {
          text-align: left;
        }

        &.time-r {
          text-align: right;
        }
      }

      .progress-bar-wrapper {
        flex: 1;
      }
    }

    .operators {
      display: flex;
      align-items: center;

      .icon {
        flex: 1;
        color: $color-theme;

        &.disable {
          color: $color-theme-d;
        }

        i {
          font-size: 30px;
        }
      }

      .i-left {
        text-align: right;
      }

      .i-center {
        padding: 0 20px;
        text-align: center;

        i {
          font-size: 40px;
        }
      }

      .i-right {
        text-align: left;
      }

      .icon-favorite {
        color: $color-sub-theme;
      }
    }
  }

  &.normal-enter-active, &.normal-leave-active {
    transition: all 0.4s;

    .top, .bottom {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
  }

  &.normal-enter, &.normal-leave-to {
    opacity: 0;

    .top {
      transform: translate3d(0, -100px, 0);
    }

    .bottom {
      transform: translate3d(0, 100px, 0);
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;

      img {
        border-radius: 50%;

        &.play {
          animation: rotate 10s linear infinite;
        }

        &.pause {
          animation-play-state: paused;
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
