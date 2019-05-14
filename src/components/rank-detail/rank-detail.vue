<template>
  <transition name='slide'>
    <music-list :songs="rankDisc" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { getRankDetail } from "api/rank";
import { ERR_OK } from "api/config";
import { getVkeyUrl } from "api/disc";
import { createSongRank } from "common/js/song";
import MusicList from "components/music-list/music-list";
export default {
  data() {
    return {
      rankDisc: []
    };
  },
  components: {
    MusicList
  },
  computed: {
    title() {
      return this.disc.topTitle;
    },
    bgImage() {
      return this.disc.picUrl;
    },

    ...mapGetters(["disc"])
  },
  created() {
    this._getDiscRankDetail(this.disc);
  },
  methods: {
    _getDiscRankDetail(disc) {
      if (!disc.id) {
        this.$router.push("/rank");
        return;
      }
      let weekOfYear = 0;
      if (
        this.disc.topTitle === "巅峰榜·流行指数" ||
        this.disc.topTitle === "巅峰榜·新歌" 
      ) {
        weekOfYear = this.getNowFormatDate();
      }else if(this.disc.topTitle === "巅峰榜·K歌金曲") {
        weekOfYear = `2019_${this.getWeekOfYear()-2}`;
      } else {
        weekOfYear = `2019_${this.getWeekOfYear()}`;
      }

      getRankDetail(disc.id, weekOfYear).then(res => {
        if (res.code === ERR_OK) {
          let ret = [];
          // console.log(res);
          const songInfoList = res.detail.data.songInfoList;
          songInfoList.forEach(item => {
            if (item.mid) {
              // console.log(item);
              getVkeyUrl(item.mid).then(v => {
                // console.log(v);
                if(v.code === ERR_OK){
                  ret.push(this._normalizeSongDisc(v.req_0.data, item));
                }
              });
            }
          });
          this.rankDisc = ret;
          console.log(this.rankDisc);
          
        }
      });
    },
    _normalizeSongDisc(items, list) {
      if (items.sip && list.mid) {
        return createSongRank(items, list);
      }
      return "";
    },
    //获取当前时间是本年的第几周减去2
    getWeekOfYear() {
      var today = new Date();
      var firstDay = new Date(today.getFullYear(), 0, 1);
      var dayOfWeek = firstDay.getDay();
      var spendDay = 1;
      if (dayOfWeek != 0) {
        spendDay = 7 - dayOfWeek + 1;
      }
      firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
      var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
      var result = Math.ceil(d / 7);
      return result - 1;
    },
    //获取当前日期
    getNowFormatDate() {
      var date = new Date();
      var seperator1 = "-";
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      var currentdate = year + seperator1 + month + seperator1 + strDate;
      return currentdate;
    }
  }
};
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable';

.listview {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>
