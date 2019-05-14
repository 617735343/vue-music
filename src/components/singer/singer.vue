<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singerList" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from "api/singer";
import { ERR_OK } from "api/config";
import pinyin from "pinyin_js";
import Singer from "common/js/singer";
import ListView from "base/listview/listview";
import {mapMutations} from 'vuex';
import {playlistMixin} from 'common/js/mixin';

const HOT_HAME = "热门";
const HOT_SINGER_LEM = 10;
export default {
  mixins: [playlistMixin],
  data() {
    return {
      singerList: []
    };
  },
  created() {
    this._getSingerList();
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.singer.style.bottom = bottom;
      this.$refs.list.refresh();
    },
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      });
      this.setSinger(singer);
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singerList =this._normalizeSinger(res.singerList.data.singerlist);
        }
      });
    },
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_HAME,
          items: []
        }
      };
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEM) {
          map.hot.items.push(
            new Singer({
              id: item.singer_mid,
              name: item.singer_name
            })
          );
        }
        //中文转成拼音
        let fullName = pinyin.pinyinWithOutYin(item.singer_name);
        //截取第一个字母并大写
        const key = fullName.substring(0, 1).toUpperCase();
        //查询map有没有这个字母key值 如果没有就创建这个key值的对象
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        //然后往相应的key值对象中的数组添加数据
        map[key].items.push(
          new Singer({
            id: item.singer_mid,
            name: item.singer_name
          })
        );
      });
      //为了得到有序列表，我们需要处理 map
      let hot = [];
      let ret = [];
      for(let key in map) {
          let val = map[key];
          //如果它的title是a-z或者A-Z的话就讲它push到ret中
          if(val.title.match(/[a-zA-Z]/)) {
              ret.push(val)
            //如果它的title是热门的话就讲它push到hot中
          }else if(val.title === HOT_HAME) {
              hot.push(val)
          }
      }
      //如果a.title.charCodeAt(0) - b.title.charCodeAt(0) > 0 就return true 这就能得到A-Z的升序排序
      ret.sort((a,b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      })
      return hot.concat(ret); //在hot数组后面里面加ret数组 得到一个一维数组
    }
  },
  components: {
    ListView
  }
};
</script>

<style scoped lang="stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
