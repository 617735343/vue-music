<template>
  <div class="rank" ref="rank">
    <scroll class="topList" :data="topList" ref="topList">
      <ul>
        <li class="item" @click="selectRank(item)" v-for="(item,index) in topList" :key="index">
          <div class="icon">
            <img
              width="100"
              height="100"
              v-lazy="item.picUrl"
              alt
            >
          </div>
          <ul class="songList">
            <li class="song" v-for="(v, idx) in item.songList" :key="idx">
              <span class="index">{{idx + 1}}</span>
              <span>{{v.songname}}-{{v.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
          <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Scroll from "@/base/scroll/scroll.vue";
import {getRank} from '@/api/rank.js';
import {ERR_OK} from '@/api/config.js';
import Loading from '@/base/loading/loading.vue';
import {playlistMixin} from 'common/js/mixin';
import {mapMutations} from 'vuex';
export default {
  mixins: [playlistMixin],
  data() {
      return {
          topList: []
      }
  },
  components: {
    Scroll,
    Loading
  },
  created() {
      this._getRank();
  },
  methods: {
      _getRank() {
          getRank().then((res) => {
              if(res.code === ERR_OK){
                  this.topList = res.data.topList;
                  console.log(this.topList)
              }
          })
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.rank.style.bottom = bottom;
        this.$refs.topList.refresh();
      },
      selectRank(item){
        this.$router.push({
          path: `/rank/${item.id}`
        });
        console.log(item);
        
        this.setDisc(item);
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
      
  }
};
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable.styl';
@import '~common/stylus/mixin.styl';

.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .topList {
    height: 100%;
    overflow: hidden;

    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songList {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          no-wrap();
          line-height: 26px;

          .index {
            padding-right: 1em;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
