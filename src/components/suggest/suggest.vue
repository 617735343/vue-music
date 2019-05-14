<template>
  <scroll @scrollToEnd="searchMore" :data="result" class="suggest" :pullup="pullup" ref="suggest">
    <ul class="suggest-list">
      <li
        @click="selectItem(item)"
        class="suggest-item"
        v-for="(item,index) in result"
        :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title></loading>
    </ul>
  </scroll>
</template>

<script>
import { search } from "api/search";
import { ERR_OK } from "api/config";
import { getVkeyUrl } from "api/disc";
import { createSongDisc } from "common/js/song";
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import Singer from "common/js/singer";
import { mapMutations, mapActions } from "vuex";

const TYPE_SINGER = "singer";
//每一页返回的个数
const perpage = 20;
export default {
  props: {
    //搜索输入的关键字
    query: {
      type: String,
      default: ""
    },
    //是否搜索歌手
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true
    };
  },
  methods: {
    //当检测到查询有改变的时候执行
    search() {
      this.page = 1;
      this.$refs.suggest.scrollTo(0, 0);
      this.hasMore = true;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this.result = this._genResult(res.data);
        //   console.log(this.result)
          //检查还有没有多余的数据
          this._checkMore(res.data);
        }
      });
    },
    _genResult(data) {
      let ret = [];
      //判断有没有歌手的数据
      if (data.zhida && data.zhida.singerid) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
      }
      //判断有没有歌曲的数据
      if (data.song) {
        //拼接数组
        ret = ret.concat(this._normalizeSongs(data.song.list));
      }
      return ret;
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSongDisc(false, musicData));
        }
      });
      return ret;
    },
    //变化搜索数据的图标
    getIconCls(item) {
      //如果它的属性是歌手的话，显示歌手图标
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    //变化搜索数据的内容
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      } else {
        return `${item.name} - ${item.singer}`;
      }
    },
    //当滚动到底部的时候，实现下拉刷新
    searchMore() {
      if (!this.hasMore) {
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data));
          //检查还有没有多余的数据
          this._checkMore(res.data);
        }
      });
    },
    //检查还有没有多余的数据
    _checkMore(data) {
      const song = data.song;
      if (
        !song.list.length ||
        song.curnum + song.curpage * perpage >= song.totalnum
      ) {
        this.hasMore = false;
      }
    },
    //点击列表执行
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        });
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer);
        
      } else {
        //   console.log(item)
        getVkeyUrl(item.mid).then(v => {
            if (v.code === ERR_OK) {
                const newsong = createSongDisc(v.req_0.data, item);
                item.url = newsong.url;
                
                this.insertSong(item);
            }
        });
      }
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions({
      insertSong: "insertSong"
    })
  },
  components: {
    Scroll,
    Loading
  },
  watch: {
    query() {
      this.search();
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
