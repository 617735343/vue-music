<template>
  <dir class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </dir>
</template>

<script>
import { prefixStyle } from "common/js/dom";
const transform = prefixStyle("transform");
//拖动按钮的宽度
const progressBtnWidth = 16;
export default {
  props: {
    //进度比例
    percent: {
      type: Number,
      default: 0
    }
  },
  created() {
    //用于在不同的回调函数里面，需要共同用的数据的时候放到里面
    this.touch = {};
  },
  methods: {
    progressTouchStart(e) {
      //是否初始化
      this.touch.initiated = true;
      //记录当前点击的横向坐标
      this.touch.startX = e.touches[0].pageX;
      //记录当点击这个按钮的时候，progress已经偏移了多少的值
      this.touch.left = this.$refs.progress.clientWidth;
    },
    progressTouchMove(e) {
      //如果没有初始化的时候
      if (!this.touch.initiated) {
        return;
      }
      //计算move的时候移动的距离(偏移量)
      const deltaX = e.touches[0].pageX - this.touch.startX;
      //计算滚动条的最终宽度，在0和计算值之间,也不能超过总进度条的宽度
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth,Math.max(0, this.touch.left + deltaX));
      this._offset(offsetWidth);
    },
    progressTouchEnd() {
        this.touch.initiated = false;
        this._triggerPercent()
    },
    //点击进度条的时候执行
    progressClick(e) {
        //获取进度条到最左边的距离
        const rect = this.$refs.progressBar.getBoundingClientRect();
        //获取点击的时候的距离
        const offsetWidth = e.pageX - rect.left;
        this._offset(offsetWidth);
        //这里当我们点击progressBtn的时候，e.offsetX 获取不对
        //让进度条变化到点击的位置
        // this._offset(e.offsetX);
        //再去监听位置的变化去派发比例
        this._triggerPercent();
    },
    //派发一个拖动后的比例
    _triggerPercent() {
        //总进度的宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        //拖动后的进度条比例
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent);
    },
    //控制进度条的宽度，和按钮的位置
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`;
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
    }
  },
  watch: {
    //监听传来的进度比例
    percent(newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        //进度条的总宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        //偏移的宽度
        const offsetWidth = newPercent * barWidth; //用偏移的比例去乘于进度条的宽度
        this._offset(offsetWidth);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable';

.progress-bar {
  height: 30px;
  padding-left: 0;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
