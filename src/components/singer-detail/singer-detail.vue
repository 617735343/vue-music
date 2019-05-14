<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import { getSingerDetail, getVkeyUrl } from "api/singer";
import { ERR_OK } from "api/config";
import { mapGetters } from "vuex";
import { createSong } from "common/js/song";
import MusicList from "components/music-list/music-list";
export default {
  data() {
    return {
      songs: []
    };
  },
  computed: {
      title() {
          return this.singer.name
      },
      bgImage() {
          return this.singer.avatar
      },
    ...mapGetters(["singer"])
  },
  created() {
    this._getSingerDetailList(this.singer);
  },
  methods: {
    _getSingerDetailList(singer) {
      //用户在歌手详情页面的时候点击刷新的时候，数据是传不到这边来的时候，我们让它回到歌手页面
      if (!singer.id) {
        this.$router.push("/singer");
        return;
      }
      getSingerDetail(singer.id).then(res => {
        if (res.code === ERR_OK) {
          let ret = [];
          res.data.list.forEach(item => {
            if (item.musicData.songmid) {
              getVkeyUrl(item.musicData.songmid).then(res => {
                  ret.push(this._normalizeSongs(res.data.items[0],item));
              });
              
            }
          });
          this.songs = ret;
              console.log(this.songs);
        }
      });
    },
    _normalizeSongs(items,list) {
        //拿到数据里面的musicData
        let { musicData } = list;
        if (musicData.songid && musicData.albummid) {
          return createSong(items,musicData);
        }
        return ""
    }
  },
  components: {
      MusicList
  }
};
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable';


.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
