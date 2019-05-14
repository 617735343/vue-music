<template>
  <transition name='slide'>
      <music-list :songs="songDisc" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { getDisc, getVkeyUrl } from "api/disc";
import { ERR_OK } from "api/config";
import { createSongDisc } from "common/js/song";
import MusicList from "components/music-list/music-list";
export default { 
    data() {
        return {
            songDisc: []
        }
    },
  computed: {
      title() {
          return this.disc.dissname
      },
      bgImage() {
          return this.disc.imgurl
      },
    ...mapGetters(["disc"])
  },
  created() {
    this._getDiscDetailList(this.disc);
  },
  methods: {
    _getDiscDetailList(disc) {
      if (!disc.dissid) {
        this.$router.push("/recommend");
        return;
      }
      getDisc(disc.dissid).then(res => {
        if (res.code === ERR_OK) {
            let ret = [];
          res.cdlist[0].songlist.forEach(item => {
            // console.log(item)
            if (item.songmid) {
              getVkeyUrl(item.songmid).then(res => {
                if (res.code === ERR_OK) {
                //   console.log(res.req_0.data);
                  ret.push(this._normalizeSongDisc(res.req_0.data,item));
                }
              });
            }
          });
          this.songDisc = ret;
          console.log(this.songDisc)
        }
      });
    },
    _normalizeSongDisc(items,list) {
        if(list.songid && list.albummid) {
            return createSongDisc(items,list);
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
