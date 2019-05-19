<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from "better-scroll";
export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });

      //监听scroll滚动的值
      if (this.listenScroll) {
        let _this = this;
        //把当前轮动的值传到父组件中
        this.scroll.on("scroll", pos => {
          _this.$emit("scroll", pos);
        });
      }

      if(this.pullup) {
        //监听滚动完执行，该事件只执行一次
        this.scroll.on('scrollEnd', () => {
          //当它快滚动到底部的时候，派发scrollToEnd事件
          if(this.scroll.y <= (this.scroll.maxScrollY + 50)){
            this.$emit('scrollToEnd');
          }
        })
      }

      if(this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    enable() {
      this.scroll && this.scroll.enable();
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    //重新计算scroll的高度
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    //如果传入的data发生变化就执行
    data() {
      setTimeout(() => {
        //重新计算scroll的高度
        this.refresh();
      }, 20);
    }
  },
};
</script>

<style>
</style>
